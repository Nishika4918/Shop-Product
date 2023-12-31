const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector("[name=id]").value;
  const _csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const productElement = btn.closest('article');

  fetch("/admin/products/" + productId, {
    method: "DELETE",
    headers: { "csrf-token": _csrf },
  })
    .then((result) => {
      return result.json()
    }).then(data=>{
        productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
};
