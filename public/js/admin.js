async function deleteProduct(id) {
        await fetch(`/admin/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(res => {
            location.replace(res.url);
        })
        .catch(error => console.error(error));
}

async function update(id) {
    const name = document.getElementById("updateName_" + id).value;
    const desc = document.getElementById("updateDesc_" + id).value;
    const price = document.getElementById("updatePrice_" + id).value;

    await fetch(`admin/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            description: desc,
            price: price
        })
    })
        .then(res => {
            window.location.href = '/adminPanel'
        })
        .catch(error => console.log(error))
}
