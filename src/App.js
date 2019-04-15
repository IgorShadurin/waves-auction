import React, {Component, Fragment} from 'react';
import './App.css';
import Auction from './Auction';

const {invokeScript, broadcast} = require('@waves/waves-transactions');

class App extends Component {
    constructor(props) {
        super(props);

        const address = localStorage.getItem('address');
        const senderPublicKey = localStorage.getItem('sender_public_key');
        const senderSeed = localStorage.getItem('sender_seed');
        this.state = {
            wavesKeeper: window.WavesKeeper,
            isLogged: true,
            address: address,
            senderPublicKey: senderPublicKey,
            senderSeed: senderSeed,
            contractAddress: '3N2xvnLofgqToJKXCRhQzUEfvmXJ951a6UK',
            page: (address && senderPublicKey && senderSeed) ? 'auction' : 'registration',
            nodeUrl: 'https://testnodes.wavesnodes.com',
            chainId: 'T',

            auctionAssetId: '',
            auctionAmount: '10',
            auctionDuration: '100',
            auctionMinBid: '0.1',

            isCreatingAuction: false,
            auctions: [],
            height: 0
        };

        //if (this.state.page === 'auction') {
        this.loadAuctions();
        setInterval(this.loadAuctions, 1000);
        //}

        this.checkWavesKeeperInterval = setInterval(() => {
            if (window.WavesKeeper) {
                console.log(window.WavesKeeper);
                this.setState({wavesKeeper: window.WavesKeeper});
                clearInterval(this.checkWavesKeeperInterval);

                /*window.WavesKeeper.publicState()
                    .then(state => {
                        console.log(state);
                        if (state.locked === false && state.account) {
                            this.setState({
                                address: state.account.address,
                                isLogged: true
                            });
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });*/
            }
        }, 100);
    }

    loadAuctions = () => {
        let height = 0;
        fetch('https://testnode1.wavesnodes.com/blocks/height')
            .then(data => data.json())
            .then(data => {
                height = data.height;
                this.setState({height});
            })
            .then(() => fetch(`https://testnode1.wavesnodes.com/addresses/data/${this.state.contractAddress}`)
                .then(data => data.json())
                .then(data => {
                    //console.log(data);
                    let auctions = [];
                    let mapped = {};
                    data.forEach(item => mapped[item.key] = item.value);
                    if (mapped['last_auction_id'] > 0) {
                        for (let i = mapped['last_auction_id']; i > 0; i--) {
                            auctions.push({
                                id: i,
                                owner: mapped[`auction_${i}_owner`],
                                amount: mapped[`auction_${i}_amount`],
                                asset_id: mapped[`auction_${i}_asset_id`],
                                duration: mapped[`auction_${i}_duration`],
                                is_active: mapped[`auction_${i}_is_active`],
                                last_bid: mapped[`auction_${i}_last_bid`],
                                last_bid_owner: mapped[`auction_${i}_last_bid_owner`],
                                min_bid: mapped[`auction_${i}_min_bid`],
                                height
                            });
                        }
                    }

                    //console.log(auctions);
                    this.setState({auctions});
                }));
    };

    onChange = (e) => {
        this.setState({
            [e.target.dataset.field]: e.target.value
        });
    };

    checkWallet = () => {
        if (!this.state.address) {
            alert('Address is empty');

            return false;
        }

        if (!this.state.senderSeed) {
            alert('Sender seed is empty');

            return false;
        }

        if (!this.state.senderPublicKey) {
            alert('Sender public key is empty');

            return false;
        }

        return true;
    };

    onLogin = () => {
        if (!this.checkWallet()) {
            return;
        }

        localStorage.setItem('address', this.state.address);
        localStorage.setItem('sender_seed', this.state.senderSeed);
        localStorage.setItem('sender_public_key', this.state.senderPublicKey);
        this.setState({page: 'auction'});
    };

    onCreateAuction = () => {
        if (!this.checkWallet()) {
            return;
        }

        if (!this.state.auctionAssetId) {
            alert('AssetID is empty');

            return;
        }

        if (!this.state.auctionAmount) {
            alert('Amount is empty');

            return;
        }

        if (!this.state.auctionDuration) {
            alert('Duration is empty');

            return;
        }

        if (!this.state.auctionMinBid) {
            alert('Min Bid is empty');

            return;
        }

        const txData = invokeScript({
            dappAddress: this.state.contractAddress,
            call: {
                function: "createAuction",
                args: [
                    {
                        type: "integer", value: this.state.auctionDuration
                    },
                    {
                        type: "integer", value: this.state.auctionMinBid * 100000000
                    },
                ]
            },
            payment: [
                {amount: this.state.auctionAmount * 100000000, assetId: this.state.auctionAssetId}
            ],
            chainId: this.state.chainId,
            senderPublicKey: this.state.senderPublicKey.trim()
        }, this.state.senderSeed.trim());

        this.setState({isCreatingAuction: true});
        broadcast(txData, this.state.nodeUrl)
            .then(resp => {
                this.setState({isCreatingAuction: false});
                console.log(resp);
                alert('Auction created');
            })
            .catch(error => {
                this.setState({isCreatingAuction: false});
                alert('Error: ' + error.message)
            });
    };

    onCancel = (id) => {
        const txData = invokeScript({
            dappAddress: this.state.contractAddress,
            call: {
                function: "cancel",
                args: [
                    {
                        type: "integer", value: id
                    }
                ]
            },
            payment: [],
            chainId: this.state.chainId,
            senderPublicKey: this.state.senderPublicKey.trim()
        }, this.state.senderSeed.trim());

        broadcast(txData, this.state.nodeUrl)
            .then(resp => {
                console.log(resp);
                alert('Auction cancelled');
            })
            .catch(error => alert('Error: ' + error.message));
    };

    onPayAndReceive = (id, amountToPay, item) => {
        const txData = invokeScript({
            dappAddress: this.state.contractAddress,
            call: {
                function: "payAndReceive",
                args: [
                    {
                        type: "integer", value: id
                    }
                ]
            },
            payment: [
                {amount: amountToPay, assetId: null}
            ],
            chainId: this.state.chainId,
            senderPublicKey: this.state.senderPublicKey.trim()
        }, this.state.senderSeed.trim());

        broadcast(txData, this.state.nodeUrl)
            .then(resp => {
                console.log(resp);
                alert('Request sent');
            })
            .catch(error => alert('Error: ' + error.message));
    };

    onBid = (id, amount) => {
        const txData = invokeScript({
            dappAddress: this.state.contractAddress,
            call: {
                function: "bid",
                args: [
                    {
                        type: "integer", value: id
                    },
                    {
                        type: "integer", value: amount * 100000000
                    },
                ]
            },
            payment: [],
            chainId: this.state.chainId,
            senderPublicKey: this.state.senderPublicKey.trim()
        }, this.state.senderSeed.trim());

        broadcast(txData, this.state.nodeUrl)
            .then(resp => {
                console.log(resp);
                alert('Bid placed');
            })
            .catch(error => alert('Error: ' + error.message));
    };

    getNavClasses = (isActive) => {
        return `btn nav-item nav-link ${isActive ? 'active' : ''}`;
    };

    setPage(e, page) {
        e.preventDefault();
        this.setState({page});
    }

    onLogout = () => {
        localStorage.setItem('address', '');
        localStorage.setItem('sender_seed', '');
        localStorage.setItem('sender_public_key', '');
        this.setState({page: 'registration'});
    };

    render() {
        const auctions = this.state.auctions.map(item => {
            let address = this.state.address ? this.state.address.toLowerCase() : this.state.address;
            return <Auction key={item.id}
                            item={item}
                            onCancel={this.onCancel}
                            onPayAndReceive={this.onPayAndReceive}
                            onBid={this.onBid}
                            address={address}
                            isOwner={item.owner ? item.owner.toLowerCase() === address : false}/>;
        });
        let page = <Fragment>

                <div className="album py-5">
                    <div className="container">
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#createAuction">
                            Create Auction
                        </button>
                        {/*<button type="button" className="btn btn-primary" onClick={this.test}>
                            Test
                        </button>*/}
                        <br/><br/>
                        <p>Current height: {this.state.height}</p>


                        <div className="modal fade" id="createAuction" tabIndex="-1" role="dialog"
                             aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">Auction</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">

                                        <div className="form-group">
                                            <label>Asset ID</label>
                                            <input type="text" className="form-control" placeholder="Asset ID"
                                                   onChange={this.onChange}
                                                   data-field="auctionAssetId"
                                                   value={this.state.auctionAssetId}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Amount</label>
                                            <input type="text" className="form-control" placeholder="Amount"
                                                   onChange={this.onChange}
                                                   data-field="auctionAmount"
                                                   value={this.state.auctionAmount}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Duration (in blocks)</label>
                                            <input type="text" className="form-control" placeholder="Duration"
                                                   onChange={this.onChange}
                                                   data-field="auctionDuration"
                                                   value={this.state.auctionDuration}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Min Bid (in WAVES)</label>
                                            <input type="text" className="form-control" placeholder="Min Bid"
                                                   onChange={this.onChange}
                                                   data-field="auctionMinBid"
                                                   value={this.state.auctionMinBid}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                            Close
                                        </button>

                                        {!this.state.isCreatingAuction && <button type="button"
                                                                                  className="btn btn-primary"
                                                                                  onClick={this.onCreateAuction}
                                        >
                                            Create
                                        </button>}

                                        {this.state.isCreatingAuction &&
                                        <button className="btn btn-primary" type="button" disabled>
                                            <span className="spinner-border spinner-border-sm" role="status"
                                                  aria-hidden="true"/>
                                            &nbsp;Creating...
                                        </button>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">

                            {auctions}

                        </div>
                    </div>
                </div>
            </Fragment>
        ;

        return (
            <Fragment>
                <div
                    className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
                    <h5 className="my-0 mr-md-auto font-weight-normal">Waves App</h5>
                    {this.state.page !== 'registration' && <nav className="my-2 my-md-0 mr-md-3">
                        <button className="p-2 text-dark btn" onClick={this.onLogout}>Logout</button>
                    </nav>}
                </div>

                {page === 'registration' &&
                <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
                    <h1 className="display-4">Waves Tokens Auctions</h1>
                    <p className="lead">
                        Transparency is a vital condition for successfully running an auction, as participants need to
                        be sure that any manipulation is ruled out.
                    </p>
                    <p className="lead">
                        Transparency can be achieved thanks to blockchain,
                        which facilitates immutability of data for all bids and the time at which they were made.
                    </p>
                </div>}

                <div className="container">
                    {this.state.page === 'registration' && <div className="d-flex justify-content-center">
                        <div className="col-sm-6">

                            <div className="form-group">
                                <label htmlFor="exampleInputPassword1">Waves Address</label>
                                <input type="text"
                                       className="form-control"
                                       placeholder="Waves Address"
                                       data-field="address"
                                       onChange={this.onChange}
                                       value={this.state.address}/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="exampleInputPassword1">Sender Public Key</label>
                                <input type="text" className="form-control"
                                       placeholder="Public Key"
                                       data-field="senderPublicKey"
                                       onChange={this.onChange}
                                       value={this.state.senderPublicKey}/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="exampleInputPassword1">Seed</label>
                                <input type="text" className="form-control"
                                       placeholder="Waves Address Seed"
                                       data-field="senderSeed"
                                       onChange={this.onChange}
                                       value={this.state.senderSeed}/>
                            </div>
                            <form action="" onSubmit={(e) => e.preventDefault()}>

                                <button className="btn btn-primary" onClick={this.onLogin}>
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>}


                    {this.state.page === 'auction' && page}

                    <footer className="pt-4 my-md-5 pt-md-5 border-top">
                        <div className="row">
                            <div className="col-12 col-md">

                                <small className="d-block mb-3 text-muted">&copy; 2019</small>
                            </div>
                        </div>
                    </footer>
                </div>

            </Fragment>
        );
    }
}

export default App;
