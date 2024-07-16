
let tbody = document.getElementById("tbody");
let nameFilter = document.getElementById("nameFilter");
let amoutFilter = document.getElementById("amoutFilter");
let data;
let transactionChart; // so i can access it in display and destroy funs

getData();

nameFilter.addEventListener("keyup", function (e) {
  if (this.value != "") {
    filterByName(this.value);
  } else {
    displayTable(data.customers, data.transactions); //if input value empty display all data
  }
});

amoutFilter.addEventListener("keyup", function (e) {
  if (this.value != "") {
    filterByAmount(this.value);
  } else {
    displayTable(data.customers, data.transactions);
  }
});

async function getData() {
  try {
    let response = await fetch(
      `https://mariamtarek22.github.io/api/customers.json`
    );
    data = await response.json();
    console.log(data);
    displayTable(data.customers, data.transactions); //display table
    displayChart(""); //display empty chart cause no customer is shown by default
    displaySelect(); // fill select element with customers options
  } catch (error) {
    console.error(error);
  }
}

function filterByName(value) {
  let filteredCustomersData = data.customers.filter((customer) => {
    if (customer.name.toLowerCase().includes(value.toLowerCase())) {
      return customer;
    }
  });

  let customersIds = filteredCustomersData.map((customer) => customer.id);

  let filteredTransactionData = data.transactions.filter((transaction) =>
    customersIds.includes(transaction.customer_id)
  );
  // console.log(filteredCustomersData);
  // console.log(customersIds);
  // console.log(filteredTransactionData);
  displayTable(filteredCustomersData, filteredTransactionData);
}

function filterByAmount(value) {
  let filteredTransactionsData = data.transactions.filter((transaction) => {
    if (transaction.amount == value) {
      return transaction;
    }
  });
  let customersIds = filteredTransactionsData.map(
    (transaction) => transaction.customer_id
  );

  let filteredCustomersData = data.customers.filter((customer) =>
    customersIds.includes(customer.id)
  );

  // console.log(customersIds);
  // console.log(filteredCustomersData);
  // console.log(filteredTransactionsData);
  displayTable(filteredCustomersData, filteredTransactionsData);
}

function displayTable(customers, transactions) {
  let customer_id;
  let customer_name;
  //console.log(customers);
  //console.log(transactions);

  let cartona = "";
  for (let i = 0; i < transactions.length; i++) {
    for (let j = 0; j < customers.length; j++) {
      if (customers[j].id == transactions[i].customer_id) {
        customer_id = customers[j].id;
        customer_name = customers[j].name;
      }
    }
    cartona += `
          <tr class="odd:bg-white even:bg-slate-100 ${customer_id}" id="${customer_name}" >
            <td class="px-6 py-4 whitespace-nowrap">${customer_id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class=" text-sm text-gray-500">${customer_name}</span>
            </td>
              <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-500">${transactions[i].id}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
              >
              ${transactions[i].date}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-500">${transactions[i].amount}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
          <button
          class="bg-transparent hover:bg-green-100 text-green-800 font-semibold hover:text-green-800 py-2 px-2 border border-green-300 hover:border-transparent rounded-xl text-sm"
          >
          Show Graph
        </button> 
        </td>

          </tr>
          
          `;
  }
  tbody.innerHTML = cartona;

  //adding on click event listener for clicking on any row => displayGraph & scroll down to graph
  for (let i = 0; i < customers.length; i++) {
    let id = customers[i].id;
    let rows = document.getElementsByClassName(`${id}`); // every className return one element or more so i have to loop it
    for (const row of rows) {
      row.addEventListener("click", function (e) {
        document.getElementById("transactionChart").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        destroyChart(); //should destroy chart before displaying another
        displayChart(this.id);
      });
    }
  }
}

function displayChart(selectedCustomerName) {
  const customerIds = data.customers
    .filter((customer) => customer.name === selectedCustomerName)
    .map((customer) => customer.id);

  // Filter transactions for the selected customer IDs
  const filteredTransactions = data.transactions.filter((transaction) =>
    customerIds.includes(transaction.customer_id)
  );

  // Aggregate total amounts per day
  const amountsPerDay = filteredTransactions.reduce((acc, transaction) => {
    const { date, amount } = transaction;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += amount;
    return acc;
  }, {});

  // Prepare data for Chart.js
  const labels = Object.keys(amountsPerDay).sort(); // Dates sorted
  const dataValues = labels.map((date) => amountsPerDay[date]);

  // Create the chart
  const ctx = document.getElementById("transactionChart").getContext("2d");
  transactionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // Dates on the X-axis
      datasets: [
        {
          label: `Total Transaction Amount for ${selectedCustomerName}`,
          data: dataValues, // Amounts on the Y-axis
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,

        },
      ],
    },
    options: {
      responsive: true, // Ensures the chart is responsive
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Total Amount",
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw}`;
            },
          },
        },
      },
    },
  });
}

function destroyChart() {
  transactionChart.destroy();
}

function displaySelect() {
  let cartona = `<option value="" selected>Choose a customer</option>`;
  for (const customer of data.customers) {
    cartona += `<option value="${customer.name}">${customer.name}</option>`;
  }
  let selectElemant = document.getElementById("customers");
  selectElemant.innerHTML = cartona;
  document.getElementById("showGraph").addEventListener("click", function (e) {
    e.preventDefault();
    destroyChart();
    displayChart(selectElemant.value);
  });
}
