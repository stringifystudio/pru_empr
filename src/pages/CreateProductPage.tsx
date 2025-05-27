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

  // Redirigir si no es admin
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setImageFiles((prev) => [...prev, ...fileArray]);

    const readers = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setImagePreviews((prev) => [...prev, ...results]);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
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
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { publicUrl } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const thumbnailUrl = uploadedUrls[mainImageIndex] || uploadedUrls[0];

      const { error } = await supabase.from('products').insert({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        brand: formData.brand,
        category: formData.category,
        stock: parseInt(formData.stock),
        discount_percentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        thumbnail: thumbnailUrl,
        images: uploadedUrls
      });

      if (error) throw error;

      toast.success('Product created successfully!');
      navigate('/admin/edit-product');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Crear nuevo producto</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">

              {/* Imagenes subidas con opción a elegir principal y botón para eliminar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes del producto
                </label>
                <div className="mt-1 flex flex-wrap gap-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative cursor-pointer">
                      <img
                        src={src}
                        alt={`Preview ${idx}`}
                        className={`h-24 w-24 object-cover rounded-md border-4 ${
                          idx === mainImageIndex ? 'border-blue-600' : 'border-transparent'
                        }`}
                        onClick={() => setMainImageIndex(idx)}
                      />
                      {/* Botón para eliminar la imagen */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar seleccionar como principal al hacer click en la X
                          setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                          setImageFiles(prev => prev.filter((_, i) => i !== idx));
                          setMainImageIndex((currentMain) => {
                            if (idx === currentMain) return 0;
                            if (idx < currentMain) return currentMain - 1;
                            return currentMain;
                          });
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                      {idx === mainImageIndex && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">Principal</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex text-sm text-gray-600">
                  <label
                    className="inline-block cursor-pointer rounded-lg border-2 border-dashed border-gray-400 px-6 py-4 text-center text-gray-600 hover:bg-gray-50 transition"
                  >
                    <span>Subir archivos</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Resto del formulario: inputs que permiten diligenciar datos */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad disponible</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Porcentaje de descuento</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/edit-product')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;
