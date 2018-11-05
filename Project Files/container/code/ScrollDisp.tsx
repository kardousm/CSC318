import * as React from "react";
import { Data, Override, PropertyControls, ControlType, Frame } from "framer";

const noChildrenStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#8855FF",
    background: "rgba(136, 85, 255, 0.1)",
    overflow: "hidden",
    fontSize: 12
};

const sa = Data({
    scrollPosition: 0,
    scrollDirection: "down",
    pointOfChange: 0
});

let posTracker = 0;
let toleranceCounter = 0;

export const getData: Override = props => { };

export const scrollComponent: Override = props => {
    return {
        onMove: point => {
            sa.scrollPosition = -point.y;

            if (sa.scrollPosition > posTracker) {
                if (sa.scrollDirection != "down") {
                    sa.pointOfChange = sa.scrollPosition;
                    toleranceCounter = 0;
                }
                sa.scrollDirection = "down";
            } else {
                if (sa.scrollDirection != "up") {
                    sa.pointOfChange = sa.scrollPosition;
                    toleranceCounter = 0;
                }
                sa.scrollDirection = "up";
            }

            posTracker = -point.y;
        }
    };
};

interface Props {
    offset: number;
    tolerance: number;
    width: number;
    height: number;
    effect: string;
    hideDirection: string;
    transitionTime: number;
    transitionCurve: string;
    customCurve: string;
}

interface State {
    visible: boolean;
}

export class ScrollAway extends React.Component<Partial<Props>, State> {
    static defaultProps = {
        offset: 50,
        tolerance: 30,
        width: 300,
        height: 80,
        effect: "move",
        hideDirection: "top",
        transitionTime: 500,
        transitionCurve: "linear",
        customCurve: "cubic-bezier(.10, .10, .25, .90)"
    };

    state = {
        visible: true
    };

    static propertyControls: PropertyControls = {
        offset: { type: ControlType.Number, title: "Offset" },
        tolerance: { type: ControlType.Number, title: "Tolerance" },
        effect: {
            type: ControlType.Enum,
            options: ["move", "fade"],
            optionTitles: ["Move", "Fade"],
            title: "Effect"
        },
        hideDirection: {
            type: ControlType.SegmentedEnum,
            options: ["top", "down", "left", "right"],
            optionTitles: ["↑", "↓", "←", "→"],
            title: "Direction",
            hidden(props) {
                return props.effect != "move";
            }
        },
        transitionCurve: {
            type: ControlType.Enum,
            options: [
                "linear",
                "ease",
                "ease-in",
                "ease-out",
                "ease-in-out",
                "custom"
            ],
            optionTitles: [
                "linear",
                "ease",
                "ease-in",
                "ease-out",
                "ease-in-out",
                "Custom..."
            ],
            title: "Easing"
        },
        customCurve: {
            type: ControlType.String,
            title: "Custom",
            hidden(props) {
                return props.transitionCurve != "custom";
            }
        },
        transitionTime: {
            type: ControlType.Number,
            min: 0,
            max: 5000,
            unit: "ms",
            step: 50,
            title: "Timing"
        }
    };

    prevDirection = sa.scrollDirection;
    componentWillReceiveProps(props: Props) {
        if (sa.scrollPosition >= this.props.offset) {
            if (sa.scrollDirection == "up") {
                toleranceCounter = sa.pointOfChange + -sa.scrollPosition;

                if (!this.state.visible && toleranceCounter >= this.props.tolerance) {
                    this.setState({ visible: true });
                }
            } else {
                toleranceCounter = -sa.pointOfChange + sa.scrollPosition;

                if (this.state.visible && toleranceCounter >= this.props.tolerance) {
                    this.setState({ visible: false });
                }
            }
        } else {
            this.setState({ visible: true });
        }

        this.prevDirection = sa.scrollDirection;
    }

    render() {
        if (this.props.children.length > 0) {
            return (
                <Frame
                    background="transparent"
                    width={this.props.width}
                    height={this.props.height}
                    style={this.toggleVisibility()}
                >
                    {this.props.children}
                </Frame>
            );
        } else {
            return (
                <div style={noChildrenStyle}>
                    Connect to the frame you want to hide ⟶
        </div>
            );
        }
    }

    private toggleVisibility(): React.CSSProperties {
        let transition;
        if (this.props.transitionCurve == "custom") {
            transition = this.props.customCurve;
        } else {
            transition = this.props.transitionCurve;
        }
        if (this.props.effect == "move") {
            return this.state.visible
                ? {
                    transition: `transform ${
                        this.props.transitionTime
                        }ms ${transition}`,
                    transform: "translate3D(0, 0, 0)"
                }
                : {
                    transition: `transform ${
                        this.props.transitionTime
                        }ms ${transition}`,
                    transform: this.hideDirection()
                };
        } else {
            return this.state.visible
                ? {
                    transition: `opacity ${this.props.transitionTime}ms ${transition}`,
                    opacity: 1
                }
                : {
                    transition: `opacity ${this.props.transitionTime}ms ${transition}`,
                    opacity: 0
                };
        }
    }

    private hideDirection(): string {
        switch (this.props.hideDirection) {
            case "right":
                return "translate3D(100%, 0, 0)";
                break;
            case "down":
                return "translate3D(0, 100%, 0)";
                break;
            case "left":
                return "translate3D(-100%, 0, 0)";
                break;
            default:
                return "translate3D(0, -100%, 0)";
        }
    }
}
