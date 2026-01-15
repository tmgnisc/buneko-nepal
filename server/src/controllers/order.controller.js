import { query, getConnection } from '../config/database.js';

// Get all orders (admin only)
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        o.id,
        o.user_id,
        u.name as user_name,
        u.email as user_email,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.phone,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await query(sql, params);

    // Get order items for each order
    for (const order of orders) {
      const [items] = await query(
        `SELECT 
          oi.id,
          oi.product_id,
          p.name as product_name,
          p.price,
          oi.quantity,
          oi.subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [orders] = await query(
      `SELECT 
        id,
        total_amount,
        status,
        shipping_address,
        phone,
        created_at,
        updated_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Get order items for each order
    for (const order of orders) {
      const [items] = await query(
        `SELECT 
          oi.id,
          oi.product_id,
          p.name as product_name,
          p.image_url,
          p.price,
          oi.quantity,
          oi.subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let sql = 'SELECT * FROM orders WHERE id = ?';
    const params = [id];

    // Non-admin users can only see their own orders
    if (userRole !== 'admin') {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    const [orders] = await query(sql, params);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await query(
      `SELECT 
        oi.id,
        oi.product_id,
        p.name as product_name,
        p.image_url,
        p.price,
        oi.quantity,
        oi.subtotal
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
    });
  }
};

// Create order
export const createOrder = async (req, res) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { items, shipping_address, phone, notes } = req.body;

    // Calculate total and validate products
    let totalAmount = 0;
    for (const item of items) {
      const [products] = await query(
        'SELECT id, price, stock FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product_id} not found`,
        });
      }

      const product = products[0];

      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
    }

    // Create order
    const [orderResult] = await query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, phone, notes)
       VALUES (?, ?, 'pending', ?, ?, ?)`,
      [userId, totalAmount, shipping_address, phone, notes || null]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of items) {
      const [products] = await query(
        'SELECT price FROM products WHERE id = ?',
        [item.product_id]
      );
      const product = products[0];
      const subtotal = product.price * item.quantity;

      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, product.price, subtotal]
      );

      // Update product stock
      await query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    // Get created order with items
    const [orders] = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItems] = await query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          ...orders[0],
          items: orderItems,
        },
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
    });
  } finally {
    connection.release();
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if order exists
    const [existingOrders] = await query(
      'SELECT id FROM orders WHERE id = ?',
      [id]
    );

    if (existingOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    const [orders] = await query('SELECT * FROM orders WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: orders[0],
      },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.userId;

    // Check if order exists and belongs to user
    const [orders] = await query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orders[0];

    if (order.status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    if (order.status === 'delivered') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order',
      });
    }

    // Restore stock
    const [items] = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );

    for (const item of items) {
      await query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Update order status
    await query(
      'UPDATE orders SET status = "cancelled", updated_at = NOW() WHERE id = ?',
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
    });
  } finally {
    connection.release();
  }
};

