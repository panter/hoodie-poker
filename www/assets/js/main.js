"use strict";

// initialize Hoodie
var hoodie = new Hoodie();

// Poker
// =====
var Card = React.createClass({
  propTypes: {
    value: React.PropTypes.number
  },

  onClick: function(event){
    this.props.onSelect(this.props.value);
  },

  render: function(){
    return <div className="card" onClick={this.onClick}>{this.props.value}</div>
  }
});

var User = React.createClass({
  render: function(){
    return <div className="card-name">{this.props.name}</div>
  }
});

var PlayedCard = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    userName: React.PropTypes.string
  },

  render: function(){
    return <div className="card-played">
      <Card value={this.props.value} />
      <User name={this.props.userName} />
    </div>
  }
});

var Deck = React.createClass({
  render: function(){
    var cards = [1, 2, 3, 4, 5, 8, 13, 21].map(function(cardValue){
      return <Card value={cardValue} key={cardValue} onSelect={this.props.onSelect} />
    }.bind(this));

    return <div className="deck">{cards}</div>
  }
});

var Table = React.createClass({
  propTypes: {
    estimates: React.PropTypes.array
  },

  render: function(){
    var playedCards = this.props.estimates.map(function(playedCard){
      return <PlayedCard value={playedCard.value} userName={playedCard.id} key={playedCard.id} />
    });

    return <div className="table">{playedCards}</div>
  }
});

var SignInForm = React.createClass({
  onSubmit: function(event){
    event.preventDefault();

    var userName = React.findDOMNode(this.refs.userName).value;
    this.props.onSignIn(userName);
  },

  render: function(){
    return <div className="signing-form">
      <form onSubmit={this.onSubmit}>
        <input ref="userName" autofocus />
        <button type="submit">Sign In</button>
      </form>
    </div>
  }
});

var PokerApp = React.createClass({
  getInitialState: function(){
    return {
      userName: null,
      estimates: []
    }
  },

  signIn: function(userName){
    this.setState({userName: userName});

    hoodie.store.add('estimates', {id: userName, value: null});
  },

  setEstimates: function(){
    hoodie.store.findAll('estimates').then(function(allEstimates) {
      this.setState({estimates: allEstimates});
    }.bind(this));
  },

  selectCard: function(value){
    hoodie.store.updateOrAdd('estimates', this.state.userName, {value: value})
  },

  componentDidMount: function(){
    hoodie.store.on('change', function() {
      this.setEstimates();
    }.bind(this));

    hoodie.account.signIn('poker', 'poker').then(function() {
      this.setEstimates();
    }.bind(this));
  },

  render: function(){
    if (this.state.userName === null) {
      return <div>
        <SignInForm onSignIn={this.signIn} />
      </div>
    } else {
      return <div>
        <h3>Hello {this.state.userName}</h3>
        <Table estimates={this.state.estimates} />
        <Deck onSelect={this.selectCard} />
      </div>
    };
  }
});

React.render(<PokerApp />, pokerApp);
