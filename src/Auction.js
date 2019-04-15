import React, {Component} from 'react';

export default class Auction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bidAmount: '0.1'
        };
    }

    onChange = (e) => {
        this.setState({
            [e.target.dataset.field]: e.target.value
        });
    };

    render() {
        const {isOwner, item, onCancel, onBid, address, onPayAndReceive} = this.props;
        let status = 'can_bid'; // can_bid, can_receive, can_cancel, outdated
        if (item.is_active) {
            if (item.owner.toLowerCase() === address.toLowerCase()) {
                status = 'can_cancel';
            } else {
                if (item.height >= item.duration) {
                    if (item.last_bid_owner.toLowerCase() === address.toLowerCase()) {
                        status = 'can_receive';
                    } else {
                        status = 'outdated';
                    }
                } else {
                    status = 'can_bid';
                }
            }
        } else {
            status = 'outdated';
        }

        //console.log(item.id, status);

        return <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <p className="card-text">Asset ID: {item.asset_id}</p>
                    <p className="card-text">Amount: {Number(item.amount / 100000000).toFixed(8)}</p>
                    <p className="card-text">Min price: {Number(item.min_bid / 100000000).toFixed(8)} WAVES</p>
                    <p className="card-text">Current Bid: {Number(item.last_bid / 100000000).toFixed(8)} WAVES</p>
                    <p className="card-text">Info - id: {item.id}, duration: {item.duration}</p>

                    {status === 'can_bid' &&
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Amount"
                                   value={this.state.bidAmount} onChange={this.onChange} data-field="bidAmount"/>
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary"
                                        onClick={() => onBid(item.id, this.state.bidAmount)}>
                                    Bid
                                </button>
                            </div>
                        </div>
                    </div>}

                    {status === 'can_cancel' && <div className="input-group mb-3">
                        <button type="button" className="btn btn-block btn-danger" onClick={() => onCancel(item.id)}>
                            Cancel
                        </button>
                    </div>}

                    {status === 'outdated' &&
                    <div className="input-group mb-3">
                        <button disabled={true} type="button" className="btn btn-block btn-danger">
                            Auction outdated
                        </button>
                    </div>}

                    {status === 'can_receive' &&
                    <div className="input-group mb-3">
                        <button type="button" className="btn btn-block btn-primary"
                                onClick={() => onPayAndReceive(item.id, item.last_bid, item)}>
                            Pay and receive tokens
                        </button>
                    </div>}
                </div>
            </div>
        </div>;
    }
}