$listener = New-Object System.Net.HttpListener
$bindAll = $true

try {
    $listener.Prefixes.Add("http://*:3000/")
    $listener.Start()
    Write-Host "HTTP Server started successfully on all interfaces."
    Write-Host "Listening on port 3000."
    
    $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -ExpandProperty IPAddress
    Write-Host "To access from your mobile phone, connect to the same Wi-Fi and open:"
    foreach ($ip in $ips) {
        Write-Host "  http://$ip`:3000/"
    }
} catch {
    Write-Host "Binding to all interfaces (port 3000) failed: $_"
    Write-Host "Falling back to localhost (http://127.0.0.1:3000/)..."
    
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://127.0.0.1:3000/")
    try {
        $listener.Start()
        Write-Host "HTTP Server started successfully on localhost."
        Write-Host "Listening on http://127.0.0.1:3000/"
    } catch {
        Write-Host "Failed to start server on localhost: $_"
        exit
    }
}

Write-Host "Press Ctrl+C to stop the server."

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }
        
        $relPath = $urlPath.TrimStart('/')
        $localPath = Join-Path (Get-Location) $relPath
        
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                ".webp" { $response.ContentType = "image/webp" }
                default { $response.ContentType = "application/octet-stream" }
            }
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        Write-Host "Error handling request: $_"
    }
}
