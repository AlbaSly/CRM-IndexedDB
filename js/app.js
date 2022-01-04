(() => {
    let DB;
    const clientsTable = document.querySelector('#listado-clientes');

    document.addEventListener('DOMContentLoaded', () => {
        createDB();

        if (window.indexedDB.open('crm', 1)) {
            getClients().then((response) => {
                loadClientsTable([...response]);
                clientsTable.addEventListener('click', deleteClient);
            });
        }
    });

    function createDB() {
        const dbCreation = window.indexedDB.open('crm', 1);

        dbCreation.onerror = () => {
            console.error('Error al crear la base de datos');
            return false;
        };

        dbCreation.onsuccess = () => {
            DB = dbCreation.result;
            console.log('DB Creada');
        };

        dbCreation.onupgradeneeded = (ev) => {
            const db = ev.target.result;

            const objectStore = db.createObjectStore('crm', {
                keyPath: 'id',
                autoIncrement: true
            });

            objectStore.createIndex('nombre', 'nombre', {
                unique: false
            });

            objectStore.createIndex('email', 'email', {
                unique: true
            });

            objectStore.createIndex('telefono', 'telefono', {
                unique: false
            });

            objectStore.createIndex('empresa', 'empresa', {
                unique: false
            });

            console.log('Columnas creadas');
        }

        return true;
    }

    function getClients() {
        return new Promise( (resolve, reject) => {
            const openConnection = window.indexedDB.open('crm', 1);

            openConnection.onerror = () => {
                console.log('Errro al cargar la base de datos');
                reject(false);
            };

            openConnection.onsuccess = () => {
                console.log('Conexión completada, obteniendo registros');
                DB = openConnection.result;
                
                const objectStore = DB.transaction('crm').objectStore('crm');
                
                let arrayData = [];
                objectStore.openCursor().onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        arrayData.unshift(cursor.value);
                        cursor.continue();
                    } else {
                        console.warn('No hay más registros');
                        resolve(arrayData);
                    }
                }
            };

            openConnection.onerror = () => {
                reject(false);
            };
        });
    }

    function loadClientsTable(arrayData) {
        // console.log(arrayData);

        arrayData.forEach(data => {
            const {nombre, email, telefono, empresa, id} = data;

            clientsTable.innerHTML += ` 
            <tr>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    <p class="text-sm leading-5 font-medium text-gray-700 text-lg  font-bold"> ${nombre} </p>
                    <p class="text-sm leading-10 text-gray-700"> ${email} </p>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 ">
                    <p class="text-gray-700">${telefono}</p>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200  leading-5 text-gray-700">    
                    <p class="text-gray-600">${empresa}</p>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5">
                    <a href="editar-cliente.html?id=${id}" class="text-teal-600 hover:text-teal-900 mr-5">Editar</a>
                    <a href="#" data-cliente="${id}" class="text-red-600 hover:text-red-900 eliminar">Eliminar</a>
                </td>
            </tr>
            `;
        });
    }

    function deleteClient(ev) {
        if (ev.target.classList.contains('eliminar')) {
            const id = Number(ev.target.dataset.cliente);

            if (confirm('¿Eliminar Cliente?')) {
                del(id).then((response) => {
                    if (response) {
                        ev.target.parentElement.parentElement.remove();
                    }
                });
            }
        }
    }

    function del(idObj) {
        return new Promise((resolve, reject) => {
            const transaction = DB.transaction(['crm'], 'readwrite');
            const objectStore = transaction.objectStore('crm');
    
            objectStore.delete(idObj);
    
            transaction.oncomplete = () => {
                resolve(true);
            };
    
            transaction.onerror = (error) => {
                console.error('Transaction failed:', error);
                reject(false);
            };
        });
    }
})();
