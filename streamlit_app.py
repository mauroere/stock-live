import streamlit as st
import requests
import pandas as pd
from datetime import datetime

# Configuración de la página
st.set_page_config(
    page_title="Stock Live - Sistema de Gestión de Inventario",
    page_icon="📦",
    layout="wide"
)

# Variables de estado para la sesión
if 'token' not in st.session_state:
    st.session_state.token = None

# Función para realizar login
def login(username, password):
    try:
        response = requests.post(
            'http://localhost:3000/auth/login',
            json={'username': username, 'password': password}
        )
        if response.status_code == 200:
            return response.json()['token']
        return None
    except:
        return None

# Función para obtener productos
def get_products(token):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get('http://localhost:3000/products', headers=headers)
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

# Función para obtener análisis de inventario
def get_inventory_analysis(token):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get('http://localhost:3000/products/analysis', headers=headers)
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

# Interfaz de login
def show_login():
    st.title("🔐 Login")
    with st.form("login_form"):
        username = st.text_input("Usuario")
        password = st.text_input("Contraseña", type="password")
        submit = st.form_submit_button("Iniciar Sesión")
        
        if submit:
            token = login(username, password)
            if token:
                st.session_state.token = token
                st.success("Login exitoso!")
                st.rerun()
            else:
                st.error("Usuario o contraseña incorrectos")

# Interfaz principal
def main():
    st.title("📦 Stock Live - Sistema de Gestión de Inventario")
    
    # Sidebar con opciones
    st.sidebar.title("Menú")
    option = st.sidebar.selectbox(
        "Seleccione una opción",
        ["Dashboard", "Productos", "Análisis de Inventario"]
    )
    
    if option == "Dashboard":
        st.header("📊 Dashboard")
        # Aquí irá el contenido del dashboard
        
    elif option == "Productos":
        st.header("📝 Productos")
        products = get_products(st.session_state.token)
        if products:
            df = pd.DataFrame(products)
            st.dataframe(df)
        else:
            st.error("Error al cargar los productos")
            
    elif option == "Análisis de Inventario":
        st.header("📈 Análisis de Inventario")
        analysis = get_inventory_analysis(st.session_state.token)
        if analysis:
            # Mostrar análisis en diferentes secciones
            col1, col2 = st.columns(2)
            with col1:
                st.subheader("Productos de bajo stock")
                if 'lowStock' in analysis:
                    st.dataframe(pd.DataFrame(analysis['lowStock']))
            with col2:
                st.subheader("Productos más vendidos")
                if 'topSelling' in analysis:
                    st.dataframe(pd.DataFrame(analysis['topSelling']))
        else:
            st.error("Error al cargar el análisis de inventario")

# Lógica principal de la aplicación
if st.session_state.token:
    main()
    if st.sidebar.button("Cerrar Sesión"):
        st.session_state.token = None
        st.rerun()
else:
    show_login()