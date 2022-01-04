(() => {
    const form = document.querySelector('#formulario');

    const nombreInput = form.querySelector('#nombre');
    const emailInput = form.querySelector('#email');
    const telefonoInput = form.querySelector('#telefono');
    const empresaInput = form.querySelector('#empresa');

    let idParam;

    let DB;
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        idParam = Number(urlParams.get('id'));
        
        connectDB().then(response => {
            if (response) {
                getClient(idParam);
            }
        });

    });

    function getClient(idParam) {
        let recordExists = false;
        const objectStore = DB.transaction('crm').objectStore('crm');
        objectStore.openCursor().onsuccess = (ev) => {
            console.log('Registros detectados');
            const cursor = ev.target.result;

            if (cursor) {
                const {id} = cursor.value;

                if (id === idParam) {
                    recordExists = true;
                    fillForm(cursor.value);
                    form.addEventListener('submit', updateClient);
                    
                    //obtener el objeto
                    return cursor.value;
                }

                cursor.continue();
            } else {
                if (!recordExists) {
                    window.location.href = 'index.html';
                }
                console.log('registros finalizados');
            }
        };
    }

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

    function fillForm(clientObj) {
        const {nombre, email, telefono, empresa, id} = clientObj;

        nombreInput.value = nombre;
        emailInput.value = email;
        telefonoInput.value = telefono;
        empresaInput.value = empresa;
    }

    function updateClient(ev) {
        ev.preventDefault();
        if (validate()) {
            const client = {
                nombre: nombreInput.value,
                email: emailInput.value,
                telefono: telefonoInput.value,
                empresa: empresaInput.value,
                id: idParam
            };

            update(client);
        }
    }

    async function update(obj) {
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        objectStore.put(obj);

        transaction.oncomplete = async () => {
            await displayAlert('Cliente actualizado', 1);
            window.location.href = 'index.html';
        };

        transaction.onerror = async (error) => {
            console.error('Transacton failed:', error);
        };
    }

    function validate() {
        if (!nombreInput.value || !emailInput.value || !telefonoInput.value || !empresaInput.value) {
            displayAlert('Todos los campos son obligatorios', 0);
            return false;
        }
        return true;
    }
})();