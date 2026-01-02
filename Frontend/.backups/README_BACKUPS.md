# 💾 SISTEMA DE BACKUPS - PROYECTO ESTILOSWEB

## 🎯 Propósito

Este directorio contiene backups de todos los archivos originales antes de aplicar mejoras.
**Si algo no te gusta, puedes restaurar cualquier archivo en segundos.**

---

## 📁 Estructura

```
.backups/
├── README_BACKUPS.md (este archivo)
├── INSTRUCCIONES_RESTAURAR.md
├── components/
│   ├── navbar.component.ts.backup
│   ├── checkout.component.ts.backup
│   └── ...
├── services/
│   ├── cart.service.ts.backup
│   └── ...
└── routes/
    └── app.routes.ts.backup
```

---

## ⚡ RESTAURAR UN ARCHIVO (rápido)

### Opción 1: Restaurar Navbar

```bash
cp .backups/components/navbar.component.ts src/app/components/navbar/navbar.component.ts
```

### Opción 2: Restaurar Checkout

```bash
cp .backups/components/checkout.component.ts src/app/components/checkout/checkout.component.ts
```

### Opción 3: Restaurar Todo

```bash
# Esto restaura TODOS los backups al estado original
bash .backups/restore_all.sh
```

---

## 📋 ARCHIVOS RESPALDADOS

### Componentes

- ✅ navbar.component.ts (nuevo - si no te gusta)
- ✅ checkout.component.ts (nuevo - si no te gusta)
- ✅ home.component.ts (original)
- ✅ product-detail.component.ts (original)
- ✅ cart.component.ts (original)

### Servicios

- ✅ cart.service.ts (original)
- ✅ product.service.ts (original)
- ✅ auth.service.ts (original)

### Rutas

- ✅ app.routes.ts (original)

---

## 🔄 FLUJO DE TRABAJO

### ANTES de implementar cambios:

```bash
# 1. Verificar que hay backups
ls -la .backups/components/

# 2. Implementar cambios
# (copiar código de GUIA_PRACTICA_IMPLEMENTACION_CODIGO.md)

# 3. Probar en local
ng serve

# 4a. SI TE GUSTA: ¡Nada que hacer! Cambios aplicados.
# 4b. SI NO TE GUSTA: Restaurar al instante
cp .backups/components/navbar.component.ts src/app/components/navbar/
```

---

## ✅ CHECKLIST ANTES DE CAMBIOS

- [ ] Ejecuté: `bash .backups/backup_before_changes.sh`
- [ ] Verifiqué que existen los backups: `ls -la .backups/`
- [ ] Implementé los cambios
- [ ] Probé en local: `ng serve`
- [ ] Si algo no gusta: `cp .backups/components/ARCHIVO.ts src/app/components/`

---

## 🆘 PROBLEMA: No puedo restaurar

**Solución:**

1. El backup puede estar comprimido:

```bash
# Si está comprimido
unzip .backups/backup_original.zip -d src/app/
```

2. O simplemente copiar manualmente:

```bash
# Abre .backups/ y busca el archivo .backup
# Cópialo a src/app/ y renómbralo (quita .backup)
```

3. Si todo falla, los archivos originales están intactos en:

```bash
cat .backups/components/navbar.component.ts.backup > src/app/components/navbar/navbar.component.ts
```

---

## 📊 TAMAÑO DE BACKUPS

```bash
# Ver tamaño total de backups
du -sh .backups/

# Ver tamaño individual
du -h .backups/*
```

---

## 🎓 IMPORTANTE

✅ **Puedes volver atrás SIN problema**
✅ **Los backups ocupan poco espacio**
✅ **Restaurar es instántaneo**
✅ **Puedes experimentar sin miedo**

---

## 📞 DUDAS

**¿Pierdo datos si restauro?**
→ No, solo vuelves a la versión anterior

**¿Puedo restaurar parcialmente?**
→ Sí, archivo por archivo

**¿Y si restauro pero luego me arrepiento?**
→ El nuevo código está guardado en el historial del editor

---

**Última actualización:** 30 de noviembre de 2025
**Estado:** 🟢 Listo para usar
