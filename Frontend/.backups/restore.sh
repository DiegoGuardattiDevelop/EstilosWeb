#!/bin/bash

# 🔄 SCRIPT DE RESTAURACIÓN
# Este script restaura archivos desde los backups

echo "🔄 RESTAURACIÓN DE ARCHIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKUP_DIR=".backups"
SRC_DIR="src/app"

# Mostrar opciones
echo "¿Qué deseas restaurar?"
echo ""
echo "1) Restaurar TODO (estado original)"
echo "2) Restaurar solo componentes"
echo "3) Restaurar solo servicios"
echo "4) Restaurar archivo específico"
echo "5) Cancelar"
echo ""
read -p "Selecciona una opción (1-5): " option

case $option in
    1)
        echo ""
        echo "⚠️  RESTAURANDO TODO A ESTADO ORIGINAL..."
        echo ""
        
        # Restaurar componentes
        echo "📁 Restaurando componentes..."
        cp "$BACKUP_DIR/components/home.component.ts.backup" "$SRC_DIR/home/home.component.ts" 2>/dev/null && echo "   ✅ home.component.ts"
        cp "$BACKUP_DIR/components/product-detail.component.ts.backup" "$SRC_DIR/components/product-detail/product-detail.component.ts" 2>/dev/null && echo "   ✅ product-detail.component.ts"
        cp "$BACKUP_DIR/components/cart.component.ts.backup" "$SRC_DIR/cart/cart.component.ts" 2>/dev/null && echo "   ✅ cart.component.ts"
        
        # Restaurar servicios
        echo ""
        echo "📁 Restaurando servicios..."
        cp "$BACKUP_DIR/services/cart.service.ts.backup" "$SRC_DIR/services/cart.service.ts" 2>/dev/null && echo "   ✅ cart.service.ts"
        cp "$BACKUP_DIR/services/auth.service.ts.backup" "$SRC_DIR/services/auth.service.ts" 2>/dev/null && echo "   ✅ auth.service.ts"
        cp "$BACKUP_DIR/services/product.service.ts.backup" "$SRC_DIR/services/product.service.ts" 2>/dev/null && echo "   ✅ product.service.ts"
        
        # Restaurar rutas
        echo ""
        echo "📁 Restaurando rutas..."
        cp "$BACKUP_DIR/routes/app.routes.ts.backup" "$SRC_DIR/app.routes.ts" 2>/dev/null && echo "   ✅ app.routes.ts"
        
        echo ""
        echo "✅ RESTAURACIÓN COMPLETADA"
        ;;
        
    2)
        echo ""
        echo "📁 Restaurando componentes..."
        cp "$BACKUP_DIR/components/home.component.ts.backup" "$SRC_DIR/home/home.component.ts" 2>/dev/null && echo "   ✅ home.component.ts"
        cp "$BACKUP_DIR/components/product-detail.component.ts.backup" "$SRC_DIR/components/product-detail/product-detail.component.ts" 2>/dev/null && echo "   ✅ product-detail.component.ts"
        cp "$BACKUP_DIR/components/cart.component.ts.backup" "$SRC_DIR/cart/cart.component.ts" 2>/dev/null && echo "   ✅ cart.component.ts"
        echo "✅ Componentes restaurados"
        ;;
        
    3)
        echo ""
        echo "📁 Restaurando servicios..."
        cp "$BACKUP_DIR/services/cart.service.ts.backup" "$SRC_DIR/services/cart.service.ts" 2>/dev/null && echo "   ✅ cart.service.ts"
        cp "$BACKUP_DIR/services/auth.service.ts.backup" "$SRC_DIR/services/auth.service.ts" 2>/dev/null && echo "   ✅ auth.service.ts"
        cp "$BACKUP_DIR/services/product.service.ts.backup" "$SRC_DIR/services/product.service.ts" 2>/dev/null && echo "   ✅ product.service.ts"
        echo "✅ Servicios restaurados"
        ;;
        
    4)
        echo ""
        echo "Archivos disponibles para restaurar:"
        echo ""
        find "$BACKUP_DIR" -name "*.backup" -type f | sed 's|.backups/||g' | sed 's|.backup||g' | nl
        echo ""
        read -p "Ingresa el número del archivo: " file_num
        
        file=$(find "$BACKUP_DIR" -name "*.backup" -type f | sed -n "${file_num}p")
        
        if [ -z "$file" ]; then
            echo "❌ Archivo no encontrado"
        else
            dest=$(echo "$file" | sed 's|.backups/||g' | sed 's|.backup||g')
            dest_path="$SRC_DIR/$dest"
            
            cp "$file" "$dest_path" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "✅ Restaurado: $dest"
            else
                echo "❌ Error al restaurar"
            fi
        fi
        ;;
        
    5)
        echo "Cancelado"
        exit 0
        ;;
        
    *)
        echo "❌ Opción inválida"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
