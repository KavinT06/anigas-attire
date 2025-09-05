// Address API helpers for Django backend
import axiosInstance from '../../utils/axiosInstance';

export async function fetchAddresses() {
  try {
    const response = await axiosInstance.get('/api/ecom/address/');
    console.log('Fetch addresses response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
}

export async function createAddress(data) {
  try {
    console.log('Creating address with payload:', data);
    const response = await axiosInstance.post('/api/ecom/address/', data);
    console.log('Create address response:', response);
    return response;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

export async function updateAddress(id, data) {
  try {
    console.log('Updating address', id, 'with payload:', data);
    const response = await axiosInstance.put(`/api/ecom/address/${id}/`, data);
    console.log('Update address response:', response);
    return response;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

export async function deleteAddress(id) {
  try {
    console.log('Deleting address:', id);
    const response = await axiosInstance.delete(`/api/ecom/address/${id}/`);
    console.log('Delete address response:', response);
    return response;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}
