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
            isVerificationSent: false,
            address: address,
            senderPublicKey: senderPublicKey,
            senderSeed: senderSeed,
            oracleAddress: '3N9UfhqeB5hRaKF9LvQrT3naVFJ8cPUAo1m',
            page: (address && senderPublicKey && senderSeed) ? 'auction' : 'registration',
            nodeUrl: 'https://testnodes.wavesnodes.com'
        };

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

    onSendData = () => {
        if (!this.checkWallet()) {
            return;
        }

        if (!this.state.email) {
            alert('Email is empty');

            return;
        }

        const txData = invokeScript({
            dappAddress: this.state.oracleAddress,
            call: {
                function: "emailPlease",
                args: [
                    {
                        type: "string", value: this.state.email
                    }
                ]
            },
            senderPublicKey: this.state.senderPublicKey.trim(),
            seed: this.state.senderSeed.trim()
        });

        broadcast(txData, this.state.nodeUrl)
            .then(resp => console.log(resp));
        this.setState({isVerificationSent: true});
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
        const auctions = [1, 2, 3, 4].map((item, index) => {
            return <Auction key={index}/>;
        });
        let page = <Fragment>


            <div className="album py-5">
                <div className="container">
                    <button className="btn btn-primary">Create Auction</button>
                    <br/><br/>
                    <div className="row">

                        {auctions}

                    </div>
                </div>
            </div>
        </Fragment>;

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

            </Fragment>);
    }
}

export default App;
