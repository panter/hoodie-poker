"use strict";

// initialize Hoodie
var hoodie = new Hoodie();

// Poker
// =====
var DeckSelect = React.createClass({
  onClick: function(event){
    this.props.onSelect(this.props.value);
  },

  render: function(){
    return <div onClick={this.onClick} className={this.props.className.join(' ')}>{this.props.value}</div>
  }
});

var Card = React.createClass({
  onClick: function(event){
    this.props.onSelect(this.props.value);
  },

  render: function(){
    var value = this.props.isVisible ? this.props.value : <div className="spinner"></div>
    return <td>
      <div onClick={this.onClick}>{value}</div>
    </td>
  }
});

var User = React.createClass({
  render: function(){
    return <td>{this.props.name}</td>
  }
});

var PlayedCard = React.createClass({
  propTypes: {
    userName: React.PropTypes.string
  },

  render: function(){
    var classNames = [];
    classNames.push(this.props.isMin ? 'is-extreme' : null);
    classNames.push(this.props.isMax ? 'is-extreme' : null);

    return <tr className={classNames.join(' ')}>
      <Card value={this.props.value} isVisible={this.props.isVisible} />
      <User name={this.props.userName} />
    </tr>
  }
});

var Deck = React.createClass({
  render: function(){
    var cards = [1, 2, 3, 5, 8, 13, 21, '?'].map(function(cardValue, idx){
      var classNames = ['deck-select'];
      classNames.push(idx < 4 ? 'deck-select-upper' : 'deck-select-lower');
      classNames.push(this.props.currentValue == cardValue ? 'is-selected' : null);

      return <DeckSelect value={cardValue} key={cardValue} onSelect={this.props.onSelect} className={classNames} />
    }.bind(this));

    return <div className="deck">{cards}</div>
  }
});

var Table = React.createClass({
  restartRound: function(){
    hoodie.store.updateAll('estimates', {value: null}).then(hoodie.remote.push)
  },

  propTypes: {
    estimates: React.PropTypes.array,
    currentUserName: React.PropTypes.string,
  },

  getMinValue: function(estimates) {
    var min = Infinity;
    estimates.forEach(function(estimate) {
      if (min == '?') { return };
      min = estimate.value < min ? estimate.value : min;
    });

    return min;
  },

  getMaxValue: function(estimates) {
    var max = 0;
    estimates.forEach(function(estimate) {
      if (max == '?') { return };
      max = estimate.value > max ? estimate.value : max;
    });

    return max;
  },

  render: function(){
    var isFinished = this.props.estimates.every(function(playedCard){
      return playedCard.value > 0
    });

    var minValue = this.getMinValue(this.props.estimates);
    var maxValue = this.getMaxValue(this.props.estimates);

    var playedCards = this.props.estimates.map(function(playedCard){
      var isVisible = isFinished || this.props.currentUserName == playedCard.id;
      var isMin = isFinished && playedCard.value == minValue;
      var isMax = isFinished && playedCard.value == maxValue;

      return <PlayedCard value={playedCard.value} userName={playedCard.id} key={playedCard.id} isVisible={isVisible} isMin={isMin} isMax={isMax} />
    }.bind(this));

    return <div className="table">
      <div className="table-header">
        <button className="button-restart" onClick={this.restartRound}>Restart</button>
      </div>
      <table className="table-players">{playedCards}</table>
    </div>
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
      currentUserName: null,
      estimates: []
    }
  },

  signIn: function(userName){
    this.setState({currentUserName: userName});

    hoodie.store.add('estimates', {id: userName, value: null}).then(hoodie.remote.push);
  },

  setEstimates: function(){
    hoodie.store.findAll('estimates').then(function(allEstimates) {
      var winner = allEstimates[0].value;
      allEstimates.forEach(function(estimate) {
        winner = winner === estimate.value ? winner : null
      });

      this.setState({
        estimates: allEstimates,
        winner: winner
      });
    }.bind(this));
  },

  selectCard: function(value){
    hoodie.store.updateOrAdd('estimates', this.state.currentUserName, {value: value}).then(hoodie.remote.push);
    this.setState({currentValue: value});
  },

  componentDidMount: function(){
    hoodie.appCache.start();

    hoodie.store.on('change', function() {
      this.setEstimates();
    }.bind(this));

    hoodie.account.signIn('poker', 'poker').then(function() {
      this.setEstimates();
    }.bind(this));
  },

  render: function(){
    if (this.state.currentUserName === null) {
      return <div>
        <SignInForm onSignIn={this.signIn} />
      </div>
    } else {
      return <div>
        <Table estimates={this.state.estimates} max={this.state.max} min={this.state.min} currentUserName={this.state.currentUserName} />
        <Deck onSelect={this.selectCard} currentValue={this.state.currentValue} />
      </div>
    };
  }
});

React.render(<PokerApp />, pokerApp);
