////////////////////////////////////
// Originally based on react-tailor
// Converted to TypeScript and swapped out react-measure for react-resize-detector
// https://github.com/chrisdrackett/react-tailor/blob/5df11a8931b176a3376e55fe902299c2585eb501/src/index.js
// License: MIT
// https://github.com/chrisdrackett/react-tailor/blob/master/LICENSE
////////////////////////////////////

import * as React from 'react';
import ReactResizeDetector from 'react-resize-detector';

export interface TailorProps {
  /**
   * The minimum size text will be sized down to
   */
  minSize: number;
  /**
   * should the text also get bigger?
   */
  canGrow: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

interface TailorState {
  firstRun: boolean;
  doneSizing: boolean;
  finalSize: number;
}

export class Tailor extends React.Component<TailorProps, TailorState> {
  private innerChild = React.createRef<HTMLSpanElement>();
  private _animationFrameID: number = 0;

  static defaultProps = {
    minSize: 11,
    canGrow: false,
  };

  constructor(props: TailorProps) {
    super(props);

    this.state = {
      firstRun: true,

      doneSizing: false,
      finalSize: 0,
    };
  }

  componentDidMount() {
    // we process on first mount to avoid as much flashing as possible.
    this.processText();
  }

  componentWillUnmount() {
    if (window !== null) {
      window.cancelAnimationFrame(this._animationFrameID);
    }
  }
  causeResize = () => {
    this.setState(
      {
        doneSizing: false,
        finalSize: 0,
      },
      () => {
        // Need to add this requestAnimationFrame to match the behavior of react-measure and fix
        // an issue where calculating the `startSize` is inaccurate.
        this._animationFrameID = window.requestAnimationFrame(() => {
          this.processText();
        });
      }
    );
  };

  processText = () => {
    const content = this.innerChild.current;

    if (!this.state.doneSizing && content && content.parentNode) {
      const parentNode = content.parentNode as HTMLSpanElement;
      const maxWidth = parentNode.offsetWidth;
      const initialHeight = parentNode.offsetHeight;

      const startSize = parseFloat(window.getComputedStyle(content, null).getPropertyValue('font-size'));

      // guess the final size and subtract 2 to reduce and/or eliminate false ellipses
      let finalSize = (startSize / content.scrollWidth) * maxWidth - 2;

      // the above got us at the correct width, but the height might be off

      content.style.fontSize = finalSize + 'px';

      const maxHeight = parseFloat(window.getComputedStyle(parentNode, null).getPropertyValue('height'));

      // only do height calc if we're in a fixed height element
      if (content.scrollHeight > maxHeight && maxHeight === initialHeight) {
        finalSize = (finalSize / content.scrollHeight) * maxHeight;
      }

      if (finalSize > startSize && !this.props.canGrow) {
        finalSize = startSize;
      }

      if (finalSize < this.props.minSize) {
        finalSize = this.props.minSize;
      }

      this.setState({
        finalSize: finalSize,
        doneSizing: true,
      });
    }
  };

  render() {
    const { minSize, canGrow, children, style, ...otherProps } = this.props;

    const containerStyle: React.CSSProperties = {
      ...style,

      // Fill whatever size our parent is
      display: 'block',
      width: '100%',
      height: '100%',
    };

    const contentStyle: React.CSSProperties = {
      fontSize: this.state.finalSize > 0 ? `${this.state.finalSize}px` : 'inherit',
      display: this.state.doneSizing ? 'block' : 'inline-block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    return (
      <ReactResizeDetector<HTMLDivElement>
        handleWidth
        handleHeight
        refreshMode="debounce"
        refreshRate={0}
        onResize={this.onResize}
      >
        {({ targetRef }) => (
          <span ref={targetRef} style={containerStyle} {...otherProps}>
            <span ref={this.innerChild} style={contentStyle}>
              {children}
            </span>
          </span>
        )}
      </ReactResizeDetector>
    );
  }

  onResize = () => {
    if (this.state.firstRun) {
      // We don't need to kick off a resize on the first run as
      // we'll already be doing one
      this.setState({ firstRun: false });
    } else {
      // If this isn't the first run, we do want to resize the text as
      // this elements size has changed
      this.causeResize();
    }
  };
}
