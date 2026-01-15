import { query } from '../config/database.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url,
        COUNT(p.id) as product_count,
        c.created_at
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC`
    );

    res.json({
      success: true,
      data: {
        categories: Array.isArray(categories) ? categories : [],
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url,
        COUNT(p.id) as product_count,
        c.created_at
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = ?
      GROUP BY c.id`,
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: {
        category: categories[0],
      },
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
    });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    // Check if category already exists
    const [existingCategories] = await query(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const [result] = await query(
      `INSERT INTO categories (name, description, image_url)
       VALUES (?, ?, ?)`,
      [name, description || null, image_url || null]
    );

    const [categories] = await query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: categories[0],
      },
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    // Check if category exists
    const [existingCategories] = await query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if name is already taken by another category
    if (name) {
      const [nameCheck] = await query(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, id]
      );
      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Category name is already taken',
        });
      }
    }

    await query(
      `UPDATE categories 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           image_url = COALESCE(?, image_url),
           updated_at = NOW()
       WHERE id = ?`,
      [name, description, image_url, id]
    );

    const [categories] = await query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: categories[0],
      },
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existingCategories] = await query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has products
    const [products] = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products',
      });
    }

    await query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
    });
  }
};

