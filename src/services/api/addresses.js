// Address API helpers for Django backend
import axiosInstance from '../../utils/axiosInstance';

export async function fetchAddresses() {
  try {
    const response = await axiosInstance.get('/api/ecom/address/');
    return response;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
}

export async function createAddress(data) {
  try {
    const response = await axiosInstance.post('/api/ecom/address/', data);
    return response;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

export async function updateAddress(id, data) {
  try {
    const response = await axiosInstance.put(`/api/ecom/address/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

export async function deleteAddress(id) {
  try {
    const response = await axiosInstance.delete(`/api/ecom/address/${id}/`);
    return response;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}
