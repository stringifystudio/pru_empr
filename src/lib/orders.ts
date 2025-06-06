import { supabase } from './supabase';
import { CartItem } from '../types';

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Corregido el tipo de status
  total: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    title: string;
    thumbnail: string;
  };
}

export async function createOrder(items: CartItem[], shippingAddress: ShippingAddress, total: number) {
  const { data: { user }, error: userError } = await supabase.auth.getUser ();
  
  if (userError || !user) {
    throw new Error('User  not authenticated');
  }

  // Start a transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total,
      shipping_address: shippingAddress,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Error creating order: ${orderError?.message}`);
  }

  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.discountPercentage 
      ? item.product.price * (1 - item.product.discountPercentage / 100)
      : item.product.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Error creating order items: ${itemsError.message}`);
  }

  return order;
}

export async function getOrders(): Promise<Order[]> {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (
          title,
          thumbnail
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (ordersError) {
    throw new Error(`Error fetching orders: ${ordersError.message}`);
  }

  return orders || [];
}

export async function getOrder(id: string): Promise<Order> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (
          title,
          thumbnail
        )
      )
    `)
    .eq('id', id)
    .single();

  if (orderError || !order) {
    throw new Error(`Error fetching order: ${orderError?.message}`);
  }

  return order;
}

// Nueva función para actualizar el estado de un pedido
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }

  return data;
}

export async function createOrderComment(orderId: string, comment: string, adminUserId: string, newStatus: string) {
  const { data, error } = await supabase
    .from('order_comments')
    .insert([
      {
        order_id: orderId,
        comment,
        admin_user_id: adminUserId,
        status: newStatus,
      },
    ]);

  if (error) throw error;
  return data;
}

export async function getOrderComments(orderId: string) {
  const { data, error } = await supabase
    .from('order_comments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return data;
}
