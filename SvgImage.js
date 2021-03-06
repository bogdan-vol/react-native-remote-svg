// @flow

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SvgUri } from 'react-native-svg';

const getHTML = (svgContent, style) => `
<html data-key="key-${style.height}-${style.width}">
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: transparent;
      }
      svg {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
</html>
`;

class SvgImage extends Component {
  state = { fetchingUrl: null, svgContent: null };
  componentDidMount() {
    this.doFetch(this.props);
  }
  componentDidUpdate(prevProps) {
    const nextUri = this.props.source && this.props.source.uri;
    const prevUri = prevProps.source && prevProps.source.uri;

    if (nextUri && prevUri !== nextUri) {
      this.doFetch(this.props);
    }
  }
  doFetch = async props => {
    let uri = props.source && props.source.uri;
    if (uri) {
      props.onLoadStart && props.onLoadStart();
      if (uri.match(/^data:image\/svg/)) {
        const index = uri.indexOf('<svg');
        this.setState({ fetchingUrl: uri, svgContent: uri.slice(index) });
      } else {
        try {
          const res = await fetch(uri);
          const text = await res.text();
          this.setState({ fetchingUrl: uri, svgContent: text });
        } catch (err) {
          console.error('got error', err);
        }
      }
      props.onLoadEnd && props.onLoadEnd();
    }
  };
  render() {
    const props = this.props;
    const { svgContent } = this.state;
    if (svgContent) {
      const flattenedStyle = StyleSheet.flatten(props.style) || {};
      const html = getHTML(svgContent, flattenedStyle);
      return props.useSvgUri && SvgUri ? (
        <SvgUri
          uri={this.props.source.uri}
          {...(props.style.width ? { width: props.style.width } : {})}
          {...(props.style.height ? { height: props.style.height } : {})}
        />
      ) : (
        <View pointerEvents='none' style={[props.style, props.containerStyle]}>
          <WebView
            originWhitelist={['*']}
            scalesPageToFit={true}
            useWebKit={true}
            style={[
              {
                width: 200,
                height: 100,
                backgroundColor: 'transparent'
              },
              props.style
            ]}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            source={{ html }}
          />
        </View>
      );
    } else {
      return (
        <View
          pointerEvents='none'
          style={[props.containerStyle, props.style]}
        />
      );
    }
  }
}

export default SvgImage;
