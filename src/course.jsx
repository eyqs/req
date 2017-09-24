import React from "react";

export default class Course extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.state = {selected: false, needs: "none"};
  };

  handleMouseClick() {
    if (this.state.needs === "done") {
      this.setState({needs: "none"});
    } else {
      this.setState({needs: "done"});
    }
  };

  handleMouseOver() {
    this.setState({selected: true});
  };

  handleMouseOut() {
    this.setState({selected: false});
  };

  render() {
    return (
      <div onMouseClick={this.onMouseClick}
           onMouseOver={this.onMouseOver}
           onMouseOut={this.onMouseOut}>
        {this.props.code}
      </div>
    );
  };
};
