import api from './api';

// Get all menu items
export const getAllMenuItems = async (token) => {
    try {
        const response = await api.get('/menu', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return { success: false, error: error.response?.data?.message || 'Failed to fetch menu items' };
    }
};

// Get a single menu item by ID
export const getMenuItemById = async (id, token) => {
    try {
        const response = await api.get(`/menu/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return { success: false, error: error.response?.data?.message || 'Failed to fetch menu item' };
    }
};

// Create a new menu item
export const createMenuItem = async (data, token) => {
    try {
      const response = await api.post('/menu', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating menu item:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create menu item' };
    }
  };
  
  // Update an existing menu item (including its `isAvailable` status)
  export const updateMenuItem = async (id, data, token) => {
    try {
      const response = await api.put(`/menu/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update menu item' };
    }
  };

// Delete a menu item
export const deleteMenuItem = async (id, token) => {
    try {
        const response = await api.delete(`/menu/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return { success: false, error: error.response?.data?.message || 'Failed to delete menu item' };
    }
}; 