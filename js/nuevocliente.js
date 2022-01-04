(() => {
    let DB;
    const form = document.querySelector('#formulario');

    document.addEventListener('DOMContentLoaded', () => {
        connectDB().then( (response) => {
            if (response) {
                form.addEventListener('submit', validate);
            }
        });
    });

    function connectDB() {
        return new Promise( (resolve, reject) => {
            const openConnection = window.indexedDB.open('crm', 1);

            openConnection.onsuccess = () => {
                console.log('Conexión realizada', openConnection.result);
                DB = openConnection.result;
                resolve(true);
            };

            openConnection.onerror = () => {
                console.error('Conexión reachazada');
                reject(false);
            };
        });
    }

    async function validate(ev) {
        ev.preventDefault();

        const nombre = form.querySelector('#nombre').value.trim();
        const email = form.querySelector('#email').value.trim();
        const telefono = form.querySelector('#telefono').value.trim();
        const empresa = form.querySelector('#empresa').value.trim();

        if (!nombre || !email || !telefono || !empresa) {
            displayAlert('Todos los campos son obligatorios', 0);
            return;
        }

        const cliente = {
            nombre,
            email,
            telefono,
            empresa
        }
        cliente.id = Date.now();

        create(cliente);
    }

    async function create(cliente) {
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        objectStore.add(cliente);

        transaction.onerror = async () => {
            console.error('Transaction failed: create');
        };

        transaction.oncomplete = async () => {
            console.log('Transaction complete: create');

            await displayAlert('Cliente agregado correctamente', 1);
            window.location.href = 'index.html';
        };
    }
})();