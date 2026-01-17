/**
 * Module Settings Controller
 * Controls sidebar menu visibility for Client and Employee dashboards
 * Company-specific settings
 */

const pool = require('../config/db');

// Default module settings - all menus enabled by default
const DEFAULT_CLIENT_MENUS = {
  dashboard: true,
  projects: true,
  proposals: true,
  store: true,
  files: true,
  billing: true,
  invoices: true,
  payments: true,
  subscriptions: true,
  orders: true,
  notes: true,
  contracts: true,
  tickets: true,
  messages: true,
};

const DEFAULT_EMPLOYEE_MENUS = {
  dashboard: true,
  myTasks: true,
  myProjects: true,
  timeTracking: true,
  events: true,
  myProfile: true,
  documents: true,
  attendance: true,
  leaveRequests: true,
  messages: true,
  tickets: true,
};

// Valid menu keys for validation
const VALID_CLIENT_MENUS = Object.keys(DEFAULT_CLIENT_MENUS);
const VALID_EMPLOYEE_MENUS = Object.keys(DEFAULT_EMPLOYEE_MENUS);

/**
 * Ensure module_settings table exists
 */
const ensureTableExists = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS module_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        client_menus JSON,
        employee_menus JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_company (company_id)
      )
    `);
    return true;
  } catch (error) {
    console.error('Error creating module_settings table:', error);
    return false;
  }
};

/**
 * Get module settings for a company
 * GET /api/v1/module-settings
 */
const getModuleSettings = async (req, res) => {
  try {
    await ensureTableExists();

    const companyId = req.query.company_id || req.user?.company_id;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    // Get settings for company
    const [rows] = await pool.execute(
      'SELECT * FROM module_settings WHERE company_id = ?',
      [companyId]
    );

    if (rows.length === 0) {
      // Return defaults if no settings exist
      return res.json({
        success: true,
        data: {
          company_id: parseInt(companyId),
          client_menus: DEFAULT_CLIENT_MENUS,
          employee_menus: DEFAULT_EMPLOYEE_MENUS,
        }
      });
    }

    // Parse JSON fields
    const settings = rows[0];
    let clientMenus = DEFAULT_CLIENT_MENUS;
    let employeeMenus = DEFAULT_EMPLOYEE_MENUS;

    try {
      if (settings.client_menus) {
        const parsed = typeof settings.client_menus === 'string' 
          ? JSON.parse(settings.client_menus) 
          : settings.client_menus;
        clientMenus = { ...DEFAULT_CLIENT_MENUS, ...parsed };
      }
    } catch (e) {
      console.error('Error parsing client_menus:', e);
    }

    try {
      if (settings.employee_menus) {
        const parsed = typeof settings.employee_menus === 'string' 
          ? JSON.parse(settings.employee_menus) 
          : settings.employee_menus;
        employeeMenus = { ...DEFAULT_EMPLOYEE_MENUS, ...parsed };
      }
    } catch (e) {
      console.error('Error parsing employee_menus:', e);
    }

    return res.json({
      success: true,
      data: {
        id: settings.id,
        company_id: settings.company_id,
        client_menus: clientMenus,
        employee_menus: employeeMenus,
        created_at: settings.created_at,
        updated_at: settings.updated_at,
      }
    });

  } catch (error) {
    console.error('Error fetching module settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch module settings',
      details: error.message
    });
  }
};

/**
 * Update module settings for a company
 * PUT /api/v1/module-settings
 */
const updateModuleSettings = async (req, res) => {
  try {
    await ensureTableExists();

    const companyId = req.body.company_id || req.query.company_id || req.user?.company_id;
    const { client_menus, employee_menus } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    // Validate client menus if provided
    if (client_menus) {
      const invalidClientKeys = Object.keys(client_menus).filter(
        key => !VALID_CLIENT_MENUS.includes(key)
      );
      if (invalidClientKeys.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid client menu keys: ${invalidClientKeys.join(', ')}`
        });
      }
    }

    // Validate employee menus if provided
    if (employee_menus) {
      const invalidEmployeeKeys = Object.keys(employee_menus).filter(
        key => !VALID_EMPLOYEE_MENUS.includes(key)
      );
      if (invalidEmployeeKeys.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid employee menu keys: ${invalidEmployeeKeys.join(', ')}`
        });
      }
    }

    // Merge with defaults to ensure all keys exist
    const finalClientMenus = client_menus 
      ? { ...DEFAULT_CLIENT_MENUS, ...client_menus }
      : DEFAULT_CLIENT_MENUS;
    
    const finalEmployeeMenus = employee_menus
      ? { ...DEFAULT_EMPLOYEE_MENUS, ...employee_menus }
      : DEFAULT_EMPLOYEE_MENUS;

    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT id FROM module_settings WHERE company_id = ?',
      [companyId]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.execute(
        `UPDATE module_settings 
         SET client_menus = ?, employee_menus = ?, updated_at = NOW()
         WHERE company_id = ?`,
        [
          JSON.stringify(finalClientMenus),
          JSON.stringify(finalEmployeeMenus),
          companyId
        ]
      );
    } else {
      // Insert new
      await pool.execute(
        `INSERT INTO module_settings (company_id, client_menus, employee_menus)
         VALUES (?, ?, ?)`,
        [
          companyId,
          JSON.stringify(finalClientMenus),
          JSON.stringify(finalEmployeeMenus)
        ]
      );
    }

    // Fetch and return updated settings
    const [rows] = await pool.execute(
      'SELECT * FROM module_settings WHERE company_id = ?',
      [companyId]
    );

    const settings = rows[0];

    return res.json({
      success: true,
      message: 'Module settings updated successfully',
      data: {
        id: settings.id,
        company_id: settings.company_id,
        client_menus: finalClientMenus,
        employee_menus: finalEmployeeMenus,
        updated_at: settings.updated_at,
      }
    });

  } catch (error) {
    console.error('Error updating module settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update module settings',
      details: error.message
    });
  }
};

/**
 * Reset module settings to defaults
 * POST /api/v1/module-settings/reset
 */
const resetModuleSettings = async (req, res) => {
  try {
    await ensureTableExists();

    const companyId = req.body.company_id || req.query.company_id || req.user?.company_id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    // Delete existing settings (will revert to defaults)
    await pool.execute(
      'DELETE FROM module_settings WHERE company_id = ?',
      [companyId]
    );

    return res.json({
      success: true,
      message: 'Module settings reset to defaults',
      data: {
        company_id: parseInt(companyId),
        client_menus: DEFAULT_CLIENT_MENUS,
        employee_menus: DEFAULT_EMPLOYEE_MENUS,
      }
    });

  } catch (error) {
    console.error('Error resetting module settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset module settings',
      details: error.message
    });
  }
};

module.exports = {
  getModuleSettings,
  updateModuleSettings,
  resetModuleSettings,
  DEFAULT_CLIENT_MENUS,
  DEFAULT_EMPLOYEE_MENUS,
};

