const headers = new Headers();

const init = {method: 'GET', headers: headers, mode: 'cors', cache: 'default'};

const url =  `http://localhost:3000/product`;

async function getDataAsync() {
    try {
        const response = await fetch(url, init);
        const json = await response.json();

        console.log(json)
        
        displayData(json);
        
    } catch (err) { 
        console.log(err);
    }
}

function displayData(products) {
    const rows = products.map(product => {
        return `<tr>
                    <td scope="row">${product.ProductId}</td>
                    <td scope="row">${product.CategoryId}</td>
                    <td scope="row">${product.ProductName}</td>
                    <td scope="row">${product.ProductDescription}</td>
                    <td scope="row">${product.ProductStock}</td>
                    <td scope="row">${product.ProductPrice}</td>
                    <td scope="row"><button id="${product.ProductId}" class="btn btn-default btn-xs">
                        <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`
    })

    document.getElementById('productRows').innerHTML = rows.join('');

    let delButtons = document.getElementsByTagName("button");

    for (let i = 0; i < delButtons.length-1; i++) {
        delButtons[i].addEventListener("click", deleteProduct);
    }
}


async function deleteProduct() {
    let id = this.id;
    console.log(`deleting ${id}`);
  
    // the url to send this request
    const url1 = url + `/${id}`;
  
    // put everything together in the request
    // note the method
    const request = {
      method: "delete",
      headers: headers,
      mode: "cors",
      cache: "default"
      
    };

    // Send request via fetch to API url
    const response = await fetch(url1, request);
    

  if (response.ok) {
    // Log the status - view in the console
    // View browser console for details
    console.log(`Product with id ${id} was deleted`);

    // reload the data
    getDataAsync();
  } else {
    // error
    console.log(`error deleteing product with id ${id}`);
  }
}

document.getElementById("addNewProd").addEventListener("click", addProduct);

async function addProduct() {
    let prodName = document.getElementById("prodName").value;
    let prodDescription = document.getElementById("prodDescription").value;
    let catId = document.getElementById("catId").value;
    let prodStock = document.getElementById("prodStock").value;
    let prodPrice = document.getElementById("prodPrice").value; 
    //console.log(prodName, prodDescription, catId, prodStock, prodPrice);
    //console.log(catId);

    if (prodName === "" || prodDescription === "" || catId === "" || prodStock === "" || prodPrice == "") {
      console.log("Invalid fields")
      return false;
    }

    let reqBody = JSON.stringify({
        "categoryId": new Number (catId),
        "productName": prodName,
        "productDescription": prodDescription,
        "productStock": new Number (prodStock),
        "productPrice":  new Number (prodPrice)
      });
      //console.log(reqBody);

    let request = {
    method: "post",
    headers: headers,
    mode: "cors",
    cache: "default",
    body: reqBody
    };
    //        headers: new Headers({'content-type': 'application/json'}),

 
    let response = await fetch(url, request);
   // console.log("response" + response);
  if (response.ok) {
    // Log the status - view in the console
    // View browser console for details
    console.log("response from post request -", response);

    // reload the data (to add new item)
    getDataAsync();

} else {
    // error
    console.log("error adding product: " + response);
  }
  return false;
}


getDataAsync();

