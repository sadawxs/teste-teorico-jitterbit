const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Conexão com o Banco de Dados (MongoDB)
mongoose.connect('mongodb://localhost:27017/ordersDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Conectado ao MongoDB"))
  .catch(err => console.error("Erro ao conectar:", err));

// Definição do Schema (Modelo conforme o mapeamento solicitado)
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    value: Number,
    creationDate: Date,
    items: [{
        productId: Number,
        quantity: Number,
        price: Number
    }]
});

const Order = mongoose.model('Order', orderSchema);

// Transformação de Dados
const mapOrderData = (data) => 
  {
    return {
        orderId: data.numeroPedido,
        value: data.valorTotal,
        creationDate: new Date(data.dataCriacao),
        items: data.items.map(item => ({
            productId: parseInt(item.idItem),
            quantity: item.quantidadeItem,
            price: item.valorItem
        }))
    };
};

// POST
app.post('/order', async (req, res) => 
  {
    try 
    {
        const mappedData = mapOrderData(req.body);
        const newOrder = new Order(mappedData);
        await newOrder.save();
        res.status(201).json({ message: "Pedido criado com sucesso!", data: newOrder });
    } 
    catch (error) 
    {
        res.status(400).json({ error: error.message });
    }
});

// GET
app.get('/order/list', async (req, res) => 
  {
    try 
    {
        const orders = await Order.find();
        res.json(orders);
    } 
    catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
});

// Obter dados por número do pedido
app.get('/order/:orderId', async (req, res) => 
  {
    try 
    {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: "Pedido não encontrado" });
        res.json(order);
    } 
    catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
});

// PUT
app.put('/order/:orderId', async (req, res) => 
  {
    try 
    {
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            req.body,
            { new: true }
        );
        res.json(updatedOrder);
    } 
    catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/order/:orderId', async (req, res) => 
  {
    try 
    {
        await Order.findOneAndDelete({ orderId: req.params.orderId });
        res.json({ message: "Pedido removido com sucesso!" });
    } 
    catch (error) 
    {
        res.status(500).json({ error: error.message });
    }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => 
  {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
