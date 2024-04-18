const express = require('express')
const path = require('path')
const app = express()
const port = 3000


function output(orders) {
    let tableHtml = `
        <html>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <head>
                <title>Order List</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background-color: #fff;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                    }
                    th, td {
                        padding: 12px 15px;
                        text-align: left;
                    }
                    th {
                        background-color: #007bff;
                        color: #fff;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                    }
                    .back-icon {
                        margin-top: 20px; /* Điều chỉnh khoảng cách phía trên nút */
                      }
                      
                      .back-icon a {
                        text-decoration: none;
                        color: #333;
                        display: inline-block;
                        padding: 5px 10px;
                        border: 1px solid #333;
                        border-radius: 5px;
                        transition: background-color 0.3s, color 0.3s;
                      }
                      
                      .back-icon a i {
                        margin-right: 5px;
                      }
                      
                      .back-icon a:hover {
                        background-color: #333;
                        color: #fff;
                      }

                </style>
            </head>
            <body>
                <div class="back-icon">
                    <a href="./home.html"><i class="fas fa-arrow-left"></i> Back to Home</a>
                </div>
                <h1 style="text-align: center;">Order List</h1>                
                <table border="1">
                    <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Total Amount</th>
                        <th>Order Status</th>
                        <th>Payment Method</th>
                        <th>Image</th>
                    </tr>
    `;

    orders.forEach(order => {
        let imageSrc = order.image.startsWith('data:image') ? order.image : `public/images/${order.image}`;
        tableHtml += `
            <tr>
                <td>${order.orderID}</td>
                <td>${order.orderDate}</td>
                <td>$${order.totalAmount}</td>
                <td>${order.orderStatus}</td>
                <td>${order.paymentMethod}</td>
                <td><img src="${imageSrc}" alt="Order Image"></td>
            </tr>
        `;
    });
    
    tableHtml += `
                </table>
            </body>
        </html>
    `;

    return tableHtml;
}

function test() {

}

module.exports = {
    output
}