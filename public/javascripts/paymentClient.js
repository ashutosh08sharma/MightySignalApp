/**
 * Created by Ashutosh on 4/22/2017.
 * Angular app
 */

var app = angular.module('PaymentApp', ['nvd3', 'toaster'])
    .service('Payment', function ($http, $q, $cacheFactory) {
        var $httpDefaultCache = $cacheFactory.get('$http');
        var vm = this;
        vm.paymentArray = [];

        function getPayment() {
            return $http({
                method: 'GET',
                url: '/api/getPayment',
                cache: true,
            }).then(function (response) {
                vm.paymentArray = response.data.data;
                return vm.paymentArray;
            }).catch(function (error) {
                console.error(error);
            });
        }

        function getPaymentArray() {
            return vm.paymentArray;
        }

        function addPayment(obj) {
            return $http({
                method: 'POST',
                data: {
                    "name": obj.name,
                    "amount": obj.amount,
                    "date": obj.date
                },
                url: '/api/add'
            }).then(function (response) {
                $httpDefaultCache.removeAll();
                vm.paymentArray.push(response.data.object);
                return response;
            }).catch(function (error) {
                console.error(error);
            });
        }

        return {
            getPaymentArray: getPaymentArray,
            getPayment: getPayment,
            addPayment: addPayment,
        };
    });

app.controller('paymentCtrl', function ($scope, $http, toaster, Payment) {
    $scope.addPayment = function () {
        obj = {
            "name": $scope.name,
            "amount": $scope.amount,
            "date": $scope.date
        };

        if (obj.name == null || obj.amount == null || obj.date == null) {
            toaster.pop({
                type: 'error',
                title: 'Fields are required',
                body: 'Please Enter Name, amount and date',
                timeout: 3000
            });


        }
        else {
            Payment.addPayment(obj).then(function (response) {
                $scope.payment = response.data;
                toaster.pop('success', "Success", "Payment Added");
                $scope.name = "";
                $scope.amount = "";
                $scope.date = "";
                console.log(response.data);
            }, function (err) {
                console.error(err);
            });
        }
    }
});


/* controller for Bar Chart*/
app.controller('Chart', function ($scope, $http, Payment) {

    $scope.payment = [];
    google.charts.load('current', {'packages': ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawChart);

    $scope.getPayment = function () {
        Payment.getPayment().then(function (paymentArray) {
            draw(paymentArray);
        });
    }

    $scope.$watch('Payment.getPaymentArray()', function (newValue) {
        draw(newValue);
    });

    function draw(paymentArray) {
        if (!paymentArray) {
            return;
        }
        $scope.payment = [];
        for (var i = 0; i < paymentArray.length; i++) {
            var date = paymentArray[i].date;
            //console.log("Date"+date);
            var res = date.split("-");
            $scope.payment.push([new Date(date), parseInt(paymentArray[i].amount)]);
        }
        drawChart();
    }

    function drawChart() {
        if (!$scope.payment.length) {
            return;
        }
        //$scope.payment.unshift(["Year","Amount"]);
        //var data = google.visualization.arrayToDataTable($scope.payment);
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Year');
        data.addColumn('number', 'Amount');
        data.addRows($scope.payment);

        var options = {
            title: 'Payment Details',
            width: 1200,
            height: 800,
            hAxis: {
                title: 'Year',
            },
            vAxis: {
                title: 'Amount',
                viewWindow: {
                    min: 0,
                    max: 1000
                },
                ticks: [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
            },
            legend: {position: 'bottom'}
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('curve_chart'));
        chart.draw(data, options);
    }
});


app.controller('barChartCtrl', function ($scope, $http, Payment) {

    $scope.payment = [];
    $scope.getPayment = function () {
        Payment.getPayment().then(function (paymentArray) {
            $scope.$watch(function () {
                return Payment.getPaymentArray();
            }, function (newValue, oldValue) {
                var paymentArray = newValue;
                //var paymentArray = Payment.getPaymentArray();

                var result = paymentArray.sort(function (a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(a.date) - new Date(b.date);
                });
                $scope.payment = result;
                $scope.options = {
                    chart: {
                        xRange: null,
                        type: 'discreteBarChart',
                        height: 750,
                        width: 1500,
                        margin: {
                            top: 20,
                            right: 20,
                            bottom: 65,
                            left: 50
                        },
                        showValues: false,
                        x: function (d) {
                            var date = new Date(d.date);
                            return date;
                            //return date.getUTCFullYear();
                        },
                        valueFormat: function (d) {
                            return d3.format(',.1f')(d);
                        },
                        y: function (d) {
                            return d.amount;
                        },
                        "xAxis": {
                            scale: d3.time.scale().domain(),
                            "axisLabel": "Year",
                            "ticks": 10,
                            "tickFormat": function (d) {
                                return d3.time.format('%b %Y')(new Date(d))
                            },
                            "rotateLabels": "-90",
                            showMaxMin: false
                        },
                        "yAxis": {
                            "axisLabel": "Amount",
                            axisLabelDistance: 100
                        },
                        forceY: 1000,
                        zoom: {
                            enabled: true,
                            scaleExtent: [1, 10],
                            useFixedDomain: false,
                            useNiceScale: false,
                            horizontalOff: false,
                            verticalOff: true,
                            unzoomEventType: 'dblclick.zoom'
                        }
                    }
                };

                $scope.data = [{
                    key: "Payments",
                    values: $scope.payment
                }]
            });
        }, function (err) {
            console.log("err" + err);
        });
    }
});
