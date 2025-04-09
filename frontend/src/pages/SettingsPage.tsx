import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { fetchConfig, saveConfig, testConnection, resetTestConnection } from '../features/settings/storeConfigSlice';
import { getUserProfileApi, updateUserProfileApi } from '../services/api';
import type { StoreConfig, UserProfile } from '../services/api';

interface ProfileFormInputs {
  name: string;
  email: string;
}

interface ConfigFormInputs extends StoreConfig {}

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { configData, status, error, testConnectionStatus, testConnectionError } = useSelector(
    (state: RootState) => state.storeConfig
  );

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormInputs>();

  const {
    register: registerConfig,
    handleSubmit: handleConfigSubmit,
    setValue: setConfigValue,
    formState: { errors: configErrors }
  } = useForm<ConfigFormInputs>();

  useEffect(() => {
    // Cargar configuración de la tienda
    dispatch(fetchConfig());

    // Cargar perfil de usuario
    const loadProfile = async () => {
      try {
        const response = await getUserProfileApi();
        const profile = response.data;
        setProfileValue('name', profile.name);
        setProfileValue('email', profile.email);
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      }
    };

    loadProfile();
  }, [dispatch, setProfileValue]);

  useEffect(() => {
    // Actualizar formulario cuando se carga la configuración
    if (configData) {
      setConfigValue('tiendanubeStoreId', configData.tiendanubeStoreId);
      setConfigValue('tiendanubeApiKey', configData.tiendanubeApiKey);
      setConfigValue('lowStockThresholdValue', configData.lowStockThresholdValue);
      setConfigValue('overStockThresholdValue', configData.overStockThresholdValue);
    }
  }, [configData, setConfigValue]);

  const onProfileSubmit = async (data: ProfileFormInputs) => {
    try {
      await updateUserProfileApi({ name: data.name });
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const onConfigSubmit = async (data: ConfigFormInputs) => {
    try {
      await dispatch(saveConfig(data)).unwrap();
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      await dispatch(testConnection()).unwrap();
      alert('Conexión exitosa con Tiendanube');
    } catch (error) {
      console.error('Error al probar la conexión:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Configuración</h1>

      {/* Sección de Perfil */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Perfil de Usuario</h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...registerProfile('email')}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              {...registerProfile('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres'
                }
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {profileErrors.name && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Guardar Cambios
          </button>
        </form>
      </div>

      {/* Sección de Configuración de Tiendanube */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Configuración Tiendanube</h2>
        <form onSubmit={handleConfigSubmit(onConfigSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID de Tienda</label>
            <input
              type="text"
              {...registerConfig('tiendanubeStoreId', {
                required: 'El ID de tienda es requerido'
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {configErrors.tiendanubeStoreId && (
              <p className="mt-1 text-sm text-red-600">{configErrors.tiendanubeStoreId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              {...registerConfig('tiendanubeApiKey', {
                required: 'El API Key es requerido'
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {configErrors.tiendanubeApiKey && (
              <p className="mt-1 text-sm text-red-600">{configErrors.tiendanubeApiKey.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Umbral de Stock Bajo</label>
            <input
              type="number"
              {...registerConfig('lowStockThresholdValue', {
                required: 'El umbral de stock bajo es requerido',
                min: { value: 0, message: 'El valor debe ser mayor o igual a 0' }
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {configErrors.lowStockThresholdValue && (
              <p className="mt-1 text-sm text-red-600">{configErrors.lowStockThresholdValue.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Umbral de Sobrestock</label>
            <input
              type="number"
              {...registerConfig('overStockThresholdValue', {
                required: 'El umbral de sobrestock es requerido',
                min: { value: 0, message: 'El valor debe ser mayor o igual a 0' }
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {configErrors.overStockThresholdValue && (
              <p className="mt-1 text-sm text-red-600">{configErrors.overStockThresholdValue.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {status === 'loading' ? 'Guardando...' : 'Guardar Configuración'}
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testConnectionStatus === 'loading'}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
            >
              {testConnectionStatus === 'loading' ? 'Probando...' : 'Probar Conexión'}
            </button>
          </div>

          {testConnectionError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{testConnectionError}</div>
            </div>
          )}

          {testConnectionStatus === 'succeeded' && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">Conexión exitosa con Tiendanube</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;