import React, {Component} from 'react';

const {invokeScript, broadcast} = require('@waves/waves-transactions');

export default class Auction extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const {isOwner} = this.props;

        return <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <p className="card-text">Asset ID: KUYf67fIYTFiytfoygUYFo76f7</p>
                    <p className="card-text">Amount: 100</p>
                    <p className="card-text">Min price: 1 WAVES</p>
                    <p className="card-text">Current Bid: 3.3245643 WAVES</p>

                    {!isOwner && <div className="d-flex justify-content-between align-items-center">
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Amount"/>
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary">
                                    Bid
                                </button>
                            </div>
                        </div>
                    </div>}

                    {isOwner && <div className="input-group mb-3">
                        <button type="button" className="btn btn-block btn-danger">
                            Cancel
                        </button>
                    </div>}
                </div>
            </div>
        </div>;
    }
}