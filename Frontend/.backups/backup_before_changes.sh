#!/bin/bash

# 🔐 SCRIPT DE BACKUP AUTOMÁTICO
# Este script crea copias de seguridad de todos los archivos importantes
# antes de aplicar cambios.

echo "🔄 Iniciando backup de archivos originales..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKUP_DIR=".backups"
SRC_DIR="src/app"

# Crear directorios de backup
mkdir -p "$BACKUP_DIR/components"
mkdir -p "$BACKUP_DIR/services"
mkdir -p "$BACKUP_DIR/routes"
mkdir -p "$BACKUP_DIR/full"

echo ""
echo "📁 Creando estructura de directorios..."

# Componentes
echo "💾 Respaldando componentes..."
cp "$SRC_DIR/home/home.component.ts" "$BACKUP_DIR/components/home.component.ts.backup" 2>/dev/null && echo "   ✅ home.component.ts"
cp "$SRC_DIR/components/product-detail/product-detail.component.ts" "$BACKUP_DIR/components/product-detail.component.ts.backup" 2>/dev/null && echo "   ✅ product-detail.component.ts"
cp "$SRC_DIR/cart/cart.component.ts" "$BACKUP_DIR/components/cart.component.ts.backup" 2>/dev/null && echo "   ✅ cart.component.ts"
cp "$SRC_DIR/components/login/login.component.ts" "$BACKUP_DIR/components/login.component.ts.backup" 2>/dev/null && echo "   ✅ login.component.ts"
cp "$SRC_DIR/components/footer/footer.component.ts" "$BACKUP_DIR/components/footer.component.ts.backup" 2>/dev/null && echo "   ✅ footer.component.ts"

# Servicios
echo ""
echo "💾 Respaldando servicios..."
cp "$SRC_DIR/services/cart.service.ts" "$BACKUP_DIR/services/cart.service.ts.backup" 2>/dev/null && echo "   ✅ cart.service.ts"
cp "$SRC_DIR/services/auth.service.ts" "$BACKUP_DIR/services/auth.service.ts.backup" 2>/dev/null && echo "   ✅ auth.service.ts"
cp "$SRC_DIR/services/product.service.ts" "$BACKUP_DIR/services/product.service.ts.backup" 2>/dev/null && echo "   ✅ product.service.ts"
cp "$SRC_DIR/services/category.service.ts" "$BACKUP_DIR/services/category.service.ts.backup" 2>/dev/null && echo "   ✅ category.service.ts"

# Rutas
echo ""
echo "💾 Respaldando rutas..."
cp "$SRC_DIR/app.routes.ts" "$BACKUP_DIR/routes/app.routes.ts.backup" 2>/dev/null && echo "   ✅ app.routes.ts"

# Backup completo
echo ""
echo "📦 Creando backup completo..."
tar -czf "$BACKUP_DIR/full/backup_completo_$(date +%Y%m%d_%H%M%S).tar.gz" "$SRC_DIR/" 2>/dev/null && echo "   ✅ Backup comprimido creado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKUP COMPLETADO"
echo ""
echo "📊 Resumen:"
find "$BACKUP_DIR" -type f | wc -l | xargs echo "   Archivos respaldados:"
du -sh "$BACKUP_DIR" | awk '{print "   Tamaño total: " $1}'
echo ""
echo "🎯 Para restaurar un archivo:"
echo "   cp .backups/components/NOMBRE.ts.backup src/app/components/NOMBRE.ts"
echo ""
