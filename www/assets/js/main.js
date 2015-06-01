"use strict";

// initialize Hoodie
var hoodie  = new Hoodie();

// React

hoodie.store.clear().then( function() {
  hoodie.store.add('estimates', {id: 'myself', value: 2});
  hoodie.store.add('estimates', {id: 'alexis', value: 5});
  hoodie.store.add('estimates', {id: 'bro', value: 3});
});

var Card = React.createClass({
  propTypes: {
    value: React.PropTypes.number
  },

  handleClick: function(){
    hoodie.store.updateOrAdd('estimates', 'myself', {value: this.props.value})
  },

  render: function(){
    return <div className="card" onClick={this.handleClick}>{this.props.value}</div>
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
      return <Card value={cardValue} key={cardValue} />
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

var PokerApp = React.createClass({
  getInitialState: function(){
    return {
      estimates: []
    }
  },

  componentDidMount: function(){
    hoodie.store.on('change', function() {
      hoodie.store.findAll('estimates').then(function(allEstimates) {
        this.setState({estimates: allEstimates});
      }.bind(this));
    }.bind(this));
  },

  render: function(){
    return <div>
      <Table estimates={this.state.estimates} />
      <Deck />
    </div>
  }
});

React.render(<PokerApp />, pokerApp);
