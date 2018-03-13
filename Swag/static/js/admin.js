$(document).ready(function () {
    var swag_table = $('#swag_table').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "pageLength": 5,
        "order": [[1, 'desc']],
        "ajax": {
            url: "/swag",
            type: 'GET'
        },
        "columnDefs": [
            {
                className: 'control',
                orderable: false,
                targets: -1
            },
            {
                "targets": 3,
                orderable: false,
                width: "47px",
                data: null,
                "defaultContent": '<div class="btn-group pull-right" role="group"><button title="Edit" class="btn btn-primary"><i class="fa fa-edit"></i></button></div>'
            }
        ],
        "columns": [
            {"data": "name", "title": "Product"},
            {"data": "description", "title": "Description"},
            {"data": "price", "render": cost, "title": "Price"},
            {"data": null}
        ]
    });

    var items_table = $('#items_table').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "pageLength": 5,
        "order": [[0, 'desc']],
        "ajax": {
            url: "/items",
            type: 'GET'
        },
        "columnDefs": [
            {
                className: 'control',
                orderable: false,
                targets: -1
            },
            {
                "targets": 5,
                orderable: false,
                width: "75px",
                data: null,
                "defaultContent": '<div class="btn-group pull-right" role="group"><button title="Edit" class="btn btn-primary"><i class="fa fa-edit"></i></button><button title="Stock" class="btn btn-secondary"><i class="fa fa-archive"></i></button></div>'
            }
        ],
        rowGroup: {
            dataSrc: 'product.name'
        },
        "columns": [
            {"data": "product.name", "title": "Image", "visible": false},
            {"data": "item_id", "visible": false},
            {"data": "image", "render": image, "title": "Image"},
            {"data": "color", "render": color, "title": "Color"},
            {"data": "stock", "title": "Stock"},
            {"data": null}
        ]
    });

    var receipts_table = $('#receipts_table').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "pageLength": 8,
        "order": [[0, 'desc']],
        "ajax": {
            url: "/receipts/all",
            type: 'GET'
        },
        "columnDefs": [
            {
                className: 'control',
                orderable: false,
                targets: -1
            },
            {
                "targets": 5,
                orderable: false,
                width: "47px",
                data: null,
                "defaultContent": '<div class="btn-group pull-right" role="group"><button title="Edit" class="btn btn-primary"><i class="fa fa-edit"></i></button></div>'
            }
        ],
        "columns": [
            {"data": "receipt_id", "visible": false},
            {"data": "purchased.item.product.name"},
            {"data": "cost", "render": cost},
            {"data": "member_uid", "render": member},
            {"data": "method", "render": method},
            {"data": null}
        ]
    });

    var ctx = $("#purchaseMethods");

    var dataset = {};
    var values = [];
    var purchaseMethods = new Chart(ctx, {
        type: 'pie',
        data: dataset
    });
    $.ajax({
        url: "/methods/all",
        method: "GET",
        success: function (data) {
            for (var key in data) {
                values.push(data[key]);
            }

            dataset = {
                datasets: [{
                    data: values,
                    backgroundColor: ["#39cb4a", "#777777", "#00b6ff"]
                }],
                labels: [
                    'Cash',
                    'Check',
                    'Venmo'
                ]
            }

            purchaseMethods = new Chart(ctx, {
                type: 'pie',
                data: dataset
            });
        }
    });

    $('#swag_table tbody').on('click', 'button', function () {
        var data = swag_table.row($(this).parents('tr')).data();

        $('#product-id').val(data.swag_id);
        $('#product-name').val(data.name);
        $('#description-text').val(data.description);
        $('#category-name').val(data.category);
        $('#price-value').val(data.price);

        $('#swagEdit').modal('toggle');
    });

    $('#items_table tbody').on('click', 'button', function () {
        var data = items_table.row($(this).parents('tr')).data();
        if ($(this).attr('title') === "Edit") {
            // Fill fields
            $('#color-text').val(data.color);
            $('#image-url').val(data.image);
            $('#item-product-id').val(data.product.swag_id);

            // Show Modal
            $('#itemEdit').modal('toggle');
        } else if ($(this).attr('title') === "Stock") {
            function template(size, value, stock_id) {
                return "<div id='size-" + size + "' class='form-group'>\n" +
                    "<label for='size-" + size + "-stock' class='col-form-label'>" + size + ":</label>\n" +
                    "<input type='text' value='" + value + "' class='form-control' id='" + stock_id + "'>\n" +
                    "</div>";
            }

            $.ajax({
                url: "/stock/" + data.item_id,
                success: function (data) {
                    $('#sizes').empty();

                    // Append Sizes for Stock
                    var stock_items = data['data'];
                    for (var index = 0; index < stock_items.length; ++index) {
                        $('#sizes').append($.parseHTML(template(stock_items[index].size, stock_items[index].stock, stock_items[index].stock_id)));
                    }

                    // Show Modal
                    $('#itemStock').modal('toggle');
                },
                error: function (data) {

                }

            });
        }
    });

    $('#receipts_table tbody').on('click', 'button', function () {
        var data = receipts_table.row($(this).parents('tr')).data();

        $('#receipt-id').val(data.receipt_id);
        $('#transaction-item-id').val(data.purchased.stock_id);
        $('#receipt-member').val(data.member_uid);
        $('#item-quantity').val(data.quantity);
        $('#payment-method').val(data.method);

        $('#editReceipt').modal('toggle');
    });

    $('#updateSwag').click(function () {
        $.ajax({
            url: "/update/swag",
            data: {
                "product-id": $('#product-id').val(),
                "product-name": $('#product-name').val(),
                "description-text": $('#description-text').val(),
                "category-name": $('#category-name').val(),
                "price-value": $('#price-value').val()
            },
            method: "POST"
        });
        swag_table.ajax.reload();
        $('#swagEdit').modal('toggle');
    });

    $('#updateItem').click(function () {
        $.ajax({
            url: "/update/item",
            data: {
                "item-id": $('#item-id').val(),
                "product-id": $('#item-product-id').val(),
                "color-text": $('#color-text').val(),
                "image-url": $('#image-url').val()
            },
            method: "POST"
        });
        items_table.ajax.reload();
        $('#itemEdit').modal('toggle');
    });

    $('#updateReceipt').click(function () {
        $.ajax({
            url: "/update/receipt",
            data: {
                "receipt-id": $('#update-receipt-id').val(),
                "transaction-item-id": $('#update-transaction-item-id').val(),
                "receipt-member": $('#update-receipt-member').val(),
                "item-quantity": $('#update-item-quantity').val(),
                "payment-method": $('#update-payment-method').val()
            },
            method: "POST"
        });
        receipts_table.ajax.reload();
        $('#editReceipt').modal('toggle');
    });

    $('#updateStock').click(function () {
        var returnData = {};
        $('#sizes').children().children('input').each(function () {
            returnData[$(this).attr('id')] = $(this).val();
        });

        $.ajax({
            url: "/update/stock",
            dataType: 'json',
            data: returnData,
            method: "POST"
        });
        items_table.ajax.reload();
        $('#itemStock').modal('toggle');
    });

    $('#createTransaction').click(function () {
        $('#newTransaction').modal('toggle');
    });

    $('#addNewTransaction').click(function () {
        $.ajax({
            url: "/new/transaction",
            dataType: 'json',
            data: {
                "transaction-item-id": $('#transaction-item-id').val(),
                "receipt-member": $('#receipt-member').val(),
                "item-quantity": $('#item-quantity').val(),
                "payment-method": $('#payment-method').val()
            },
            method: "PUT"
        });
        receipts_table.ajax.reload();
        $('#newTransaction').modal('toggle');
    });
});