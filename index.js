const exprees = require('express');
const { db } = require('./firebase');
const cors = require('cors');

const app = exprees();
app.use(cors({ origin: true }));
app.use(exprees.json());

const COLLECTION = "productos"

app.post("/productos", async (req, res) => {
    try {
        const data = req.body;

        const requiredFields = [
            "cantidadStock",
            "codigoBarra",
            "fechaCompra",
            "marca",
            "nombre",
            "precioCompra",
            "precioVenta",
            "proveedor",
            "fechaVencimiento",
        ];
        for (const field of requiredFields) {
            if (
                data[field] === undefined ||
                data[field] === null ||
                data[field] === "" ||
                (typeof data[field] === "number" && data[field] <= 0)
            ) {
                return res.status(400).json({
                    mensaje: `Falta o es inválido el campo obligatorio: ${field}`,
                });
            }
        }
        if (!Number.isInteger(data.cantidadStock)) {
            return res.status(400).json({
                mensaje: "El stock debe ser un número entero mayor a 0",
            });
        }
        const existente = await db
            .collection(COLLECTION)
            .where("codigoBarra", "==", data.codigoBarra)
            .get();

        if (!existente.empty) {
            return res.status(400).json({
                mensaje: "El código de barra ya existe en otro producto",
            });
        }
        const nuevo = await db.collection(COLLECTION).add(data);

        res.json({
            id: nuevo.id,
            mensaje: "Producto guardado exitosamente",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});


app.get("/productos", async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        const productos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.get("/productos/codigo/:codigo", async (req, res) => {
    try {
        const codigo = req.params.codigo;
        const snapshot = await db.collection(COLLECTION).where("codigoBarra", "==", codigo).get();
        if (snapshot.empty) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        const productos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(productos[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});
