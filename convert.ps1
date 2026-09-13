Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Proyectos\Gestion compras\public\presupro-logo.png")
$file = [System.IO.FileStream]::new("C:\Proyectos\Gestion compras\icono.ico", [System.IO.FileMode]::Create)
$img.Save($file, [System.Drawing.Imaging.ImageFormat]::Icon)
$file.Close()
$img.Dispose()
