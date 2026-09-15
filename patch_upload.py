import re

with open(r'c:\Proyectos\Gestion compras\src\components\CRMProveedores.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Change permission check
old_code = """        if (error) {
          console.error('Error uploading file: ', error);
          continue;
        }"""

new_code = """        if (error) {
          console.error('Error uploading file: ', error);
          setDialogConfig({
            isOpen: true,
            type: 'alert',
            title: 'Error de Servidor',
            message: 'No se pudo subir el archivo. Verifica que el Bucket "proveedores-docs" exista en Supabase y sea Público.',
            onConfirm: () => setDialogConfig({ isOpen: false })
          });
          continue;
        }"""

code = code.replace(old_code, new_code)

with open(r'c:\Proyectos\Gestion compras\src\components\CRMProveedores.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
