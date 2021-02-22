import React, { Component, Fragment } from 'react';
import axios from 'axios';
const paysafe = window.paysafe;

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: "",
            amount: "",
            city: "",
            countryCode: "",
            email: "",
            firstName: "",
            lastName: "",
            state: "",
            zipcode: "",
            SUToken:"",
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkout = this.checkout.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        let body ={
            ref: Math.floor(100000000 + Math.random() * 90000000000),
            email: this.state.email,
        }
        axios.post('/api/createCutomer', body)
            .then(response => {
                return axios.get('/api/createSingleUseCustomerTokem',{params:{id:response.data.customerId}}) 
            })
            .then(response =>{
                this.setState({
                    SUToken:response.data.singleUseCustomerToken,
                    ref:body.ref
                })
            })
            .then(response =>{
                 this.checkout()
            })
            .catch(err => {
                alert(err.message);
            });  
        event.preventDefault();
    }

    checkout(){
        paysafe.checkout.setup("cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=", {
            "currency": "USD",
            "amount": parseInt(this.state.amount),
            "singleUseCustomerToken": this.state.SUToken,
            "locale": "en_US",
            "customer": {
                "firstName": this.state.firstName,
                "lastName": this.state.lastName,
                "email": this.state.email,
                "phone": "1234567890",
                "dateOfBirth": {
                    "day": 1,
                    "month": 7,
                    "year": 1990
                }
            },
            "billingAddress": {
                "nickName": this.state.firstName,
                "street": this.state.address,
                "city": this.state.city,
                "zip": this.state.zipcode,
                "country": this.state.countryCode,
                "state": this.state.state
            },
            "environment": "TEST",
            "merchantRefNum": this.state.ref.toString(),
            "canEditAmount": true,
            "merchantDescriptor": {   
                "dynamicDescriptor": "XYZ",
                "phone": "1234567890"
                },
            "displayPaymentMethods":["skrill","card"],
            "paymentMethodDetails": {
                "paysafecard": {
                    "consumerId": "1232323"
                },
                "paysafecash": {
                    "consumerId": "123456"
                },
                "sightline": {
                    "consumerId": "123456",
                    "SSN": "123456789",
                    "last4ssn": "6789",
                    "accountId":"1009688222"
                },
                "vippreferred":{
                    "consumerId": "550726575",
                    "accountId":"1679688456"
                }
            }
        }, (instance, error, result) => {
            if (result && result.paymentHandleToken) {
                let body = {
                    "merchantRefNum": this.state.ref,
                    "amount": this.state.amount,
                    "currencyCode": "USD",
                    "paymentHandleToken": result.paymentHandleToken
                  }
                return axios.post('/api/processPayment', body)
                .then(response => {
                    if(response.data!== null){
                        instance.showSuccessScreen("Payment Successful!");
                    }else{
                        instance.showFailureScreen("Payment Declined."); 
                    }
                })
                .catch(err => {
                    alert(err.message);
                });  
            } else {
                alert(error);
                // Handle the error
            }
        }, function(stage, expired) {
            switch(stage) {
                case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
                case "PAYMENT_HANDLE_CREATED": // Handle the scenario
                case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
                case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
                default: // Handle the scenario
            }
        });
    }

    render() {
        return (
            <div className='container'>
                <h4 className="mb-3">Billing Page</h4>
                <form onSubmit={this.handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6 mb-3">
                            <span>First name</span>
                            <input type="text" className="form-control" name="firstName" value={this.state.firstName} onChange={this.handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <span>Last name</span>
                            <input type="text" className="form-control" name="lastName" value={this.state.lastName} onChange={this.handleChange} required />
                        </div>
                    </div>
                    <div className="mb-3">
                        <span>Email</span>
                        <input type="email" className="form-control" name="email" placeholder="you@example.com" value={this.state.email} onChange={this.handleChange} required />
                    </div>
                    <div className="mb-3">
                        <span>Address</span>
                        <input type="text" className="form-control" name="address" placeholder="1234 Main St" value={this.state.address} onChange={this.handleChange} required />
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6 mb-3">
                            <span>City</span>
                            <input type="text" className="form-control" name="city"  value={this.state.city} onChange={this.handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <span>State Code(eg: CA)</span>
                            <input type="text" className="form-control" name="state" value={this.state.state} onChange={this.handleChange} required />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6 mb-3">
                            <span>Zip Code</span>
                            <input type="number" className="form-control" name="zipcode" value={this.state.zipCode} onChange={this.handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <span>Country Code(eg: US)</span>
                            <input type="text" className="form-control" name="countryCode" value={this.state.countryCode} onChange={this.handleChange} required />
                        </div>
                    </div>
                    <div className="mb-3">
                        <span>Amount to Pay</span>
                        <input type="number" className="form-control" name="amount" value={this.state.amount} onChange={this.handleChange} required />
                    </div>
                    <input className="button btn btn-primary" type="submit" value="Checkout" />
                </form>
            </div>
        );
    }
}

export default Checkout;