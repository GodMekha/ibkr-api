const Alpaca = require('@alpacahq/alpaca-trade-api');

const alpaca = new Alpaca({
  keyId: 'CKUVSVORJ5IP3CX6EF75W33TFQ',
  secretKey: 'EH7E1ujtT8cihMxAxUD6h792FoYyzF5h1h1nKdEUa9Eh',
  paper: true, // true = sandbox
  baseUrl: 'https://broker-api.sandbox.alpaca.markets'
});

// ທົດສອບການເຊື່ອມຕໍ່
async function testConnection() {
  try {
    const clock = await alpaca.getClock();
    console.log('Connection successful!');
    console.log('Server time:', clock.timestamp);
    console.log('Market is ' + (clock.is_open ? 'open' : 'closed'));
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    return false;
  }
}

// ກວດບັນຊີ
async function getAccount() {
  const account = await alpaca.getAccount();
  console.log(`Account ID: ${account.id}`);
  console.log(`Balance: ${account.cash}`);
}

// ດຶງລາຍການຫຸ້ນທີ່ຊື້ຂາຍໄດ້
async function getAssets() {
  const assets = await alpaca.getAssets({ status: 'active' });
  console.log('Available symbols:', assets.slice(0, 5).map(a => a.symbol));
}

// ສ້າງຄໍາສັ່ງຊື້
async function placeOrder() {
  const order = await alpaca.createOrder({
    symbol: 'AAPL',
    qty: 1,
    side: 'buy',
    type: 'market',
    time_in_force: 'gtc'
  });
  console.log('Order:', order.id);
}

// ດຶງປະຫວັດການສັ່ງ
async function listOrders() {
  const orders = await alpaca.getOrders({ status: 'all', limit: 5 });
  console.log('Last orders:', orders.map(o => `${o.symbol} (${o.side})`));
}

// ທົດລອງໃຊ້
(async () => {
  try {
    // ທົດສອບການເຊື່ອມຕໍ່ກ່ອນ
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to Alpaca. Please check your credentials.');
      return;
    }
    
    await getAccount();
    await getAssets();
    await placeOrder();
    await listOrders();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
