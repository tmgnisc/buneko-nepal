import { query } from '../config/database.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category_id, search } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.category_id,
        c.name as category_name,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];

    if (category_id) {
      countSql += ' AND category_id = ?';
      countParams.push(category_id);
    }

    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await query(countSql, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.category_id,
        c.name as category_name,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: {
        product: products[0],
      },
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [products] = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        p.category_id,
        c.name as category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [categoryId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category_id, stock, image_url } = req.body;

    const [result] = await query(
      `INSERT INTO products (name, description, price, category_id, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, category_id, stock || 0, image_url || null]
    );

    const [products] = await query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: products[0],
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, stock, image_url } = req.body;

    // Check if product exists
    const [existingProducts] = await query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category_id = ?, 
           stock = ?, image_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, price, category_id, stock, image_url, id]
    );

    const [products] = await query('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: products[0],
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProducts] = await query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await query('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
    });
  }
};

