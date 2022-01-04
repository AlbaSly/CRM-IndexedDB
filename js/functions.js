async function connectDB() {
    return new Promise( (resolve, reject) => {
        const openConnection = window.indexedDB.open('crm', 1);

        openConnection.onerror = () => {
            console.error('Error al cargar la base de datos');
            reject(false);
        }

        openConnection.onsuccess = () => {
            console.log('Conexión completada', openConnection.result);
            DB = openConnection.result;
            resolve(true);
        };
    });
}

function displayAlert(message, type) {
    return new Promise((resolve, reject) => {
        const divAlert = document.createElement('div');
        divAlert.classList.add('px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center');
    
        switch (type) {
            case 0:
                divAlert.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                break;
            case 1:
                divAlert.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
                break;
        }

        divAlert.textContent = message;
        const form = document.querySelector('#formulario');
        form.appendChild(divAlert);
        setTimeout(() => {
            divAlert.remove();
            resolve();
        }, 2500);
    });
}