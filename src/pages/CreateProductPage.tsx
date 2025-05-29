import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    stock: '',
    discountPercentage: ''
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    setImageFiles(prev => [...prev, ...fileArray]);

    const readers = fileArray.map(file => {
      return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setImagePreviews(prev => [...prev, ...results]);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Por favor sube al menos una imagen.");
      return;
    }
    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        // CORRECCIÓN: getPublicUrl devuelve { data: { publicUrl } }, no directamente publicUrl
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública.");

        uploadedUrls.push(data.publicUrl);
      }

      const thumbnailUrl = uploadedUrls[mainImageIndex] || uploadedUrls[0];

      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        brand: formData.brand || null,
        category: formData.category || null,
        stock: parseInt(formData.stock),
        thumbnail: thumbnailUrl,
        images: uploadedUrls,
      };

      if (formData.discountPercentage) {
        productData.discount_percentage = parseFloat(formData.discountPercentage);
      }

      console.log('Datos del producto a insertar:', productData);

      const { error } = await supabase.from('products').insert(productData);
      if (error) throw error;

      toast.success('¡Producto creado exitosamente!');
      navigate('/admin/edit-product');
    } catch (error: any) {
      console.error('Error creando producto:', error);
      toast.error(error.message || 'Error al crear el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Crear nuevo producto</h1>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Imágenes */}
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-3">Imágenes del producto</label>
              <div className="flex flex-wrap gap-4 mb-4">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative cursor-pointer">
                    <img
                      src={src}
                      alt={`Preview ${idx}`}
                      className={`h-24 w-24 object-cover rounded-lg border-4 transition-colors duration-300 ${idx === mainImageIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                      onClick={() => setMainImageIndex(idx)}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                        setImageFiles(prev => prev.filter((_, i) => i !== idx));
                        setMainImageIndex(prev => {
                          if (idx === prev) return 0;
                          return prev > idx ? prev - 1 : prev;
                        });
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-bold hover:bg-red-700 flex items-center justify-center"
                      aria-label="Eliminar imagen"
                    >
                      ×
                    </button>
                    {idx === mainImageIndex && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded select-none">Principal</div>
                    )}
                  </div>
                ))}
              </div>
              <label className="inline-block cursor-pointer border-2 border-dashed border-gray-400 px-6 py-4 rounded-lg hover:bg-gray-100 text-center text-gray-600 font-semibold">
                Subir archivos
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Campos formulario */}
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Título</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={4} required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Marca</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Categoría</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecciona una categoría</option>
                <option value="f78c5ed5-d064-49cb-850f-8bd8bc4f08dc">Ropa</option>
                <option value="610486ca-f06e-443e-a291-33da896dce41">Joyería</option>
                <option value="b112bffd-e2a2-45ee-bb7a-8761571cd050">Relojes</option>
                <option value="781fbf1c-4d0d-4d2f-a667-cd1456498517">Bolsos</option>
                <option value="a984e494-e064-4385-b5aa-d8ccc3b4cf92">Ofertas</option>
              </select>
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Cantidad disponible</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Porcentaje de descuento</label>
              <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" max="100" />
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/admin/edit-product')} className="px-5 py-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <Loader className="animate-spin h-5 w-5 mr-2" /> : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;


