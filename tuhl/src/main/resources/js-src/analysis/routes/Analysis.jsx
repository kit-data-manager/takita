import React, { useState } from 'react';
import { Form, Outlet, useLoaderData } from 'react-router-dom';
import { cloneDeep } from 'lodash';

import { storeSearchAnalytics } from '../data/api';
import { loadAnalysis, storeAnalysis } from '../data';
import { Message } from '../data/models';
import { createRoute, encodeURL, getAnnoId, normalizeBasename, getSessionId } from '../utils';

import { AnalysisSidebar } from '../components/sidebar';
import { MessageBox } from '../components/messageBox';
import Header from '../components/header';
import Icon from '../components/icon';

/**
 * Automatically called when this route's form is submitted.
 */
const action = async ({ params, request }) => {
  console.log('Analysis.action()');
};

/**
 * Data fetcher, automatically called when this route is requested.
 */
const loader = async () => {
  console.log('enter Analysis.loader()');
  const aid = getAnnoId();
  const { appState, originalAnnotation, etag } = await loadAnalysis(aid);
  console.log('exit Analysis.loader()');
  return { appState, originalAnnotation, etag };
};

const Analysis = () => {
  const { appState, originalAnnotation, etag } = useLoaderData();
  const [currentAppState, setCurrentAppState] = useState(appState);
  const [currentEtag, setCurrentEtag] = useState(etag);
  const [latestOriginal, setLatestOriginal] = useState(originalAnnotation);
  const [messages, setMessages] = useState([]);
  const [searchLog, setSearchLog] = useState([]);
  const sessionID = getSessionId();

  const addSearchLog = (query, selectedURI, selectedRank, annoURI) => {
    if (query) {
      setSearchLog((prev) => {
        prev.push({ query, selectedURI, selectedRank, annoURI });
        return prev;
      });
    }
  };

  const clearSearchLog = () => {
    setSearchLog([]);
  };

  const sendSearchLog = () => {
    searchLog.forEach((log) => {
      const { query, selectedURI, selectedRank, annoURI } = log;
      storeSearchAnalytics(query, selectedURI, selectedRank, annoURI, sessionID);
    });
  };

  const addMessage = (msg) => {
    setMessages((prev) => {
      const msgList = cloneDeep(prev);
      msgList.push(msg);
      return msgList;
    });
  };
  const clearMessages = () => {
    setMessages([]);
  };

  const onClickReset = async (ev) => {
    ev.preventDefault();
    const reloaded = await loader();
    setCurrentAppState(cloneDeep(reloaded.appState));
    const msg = new Message({
      text: 'reset analysis to latest saved state',
      type: 'success',
    });
    addMessage(msg);
    clearSearchLog();
  };

  const onClickSave = async (ev) => {
    ev.preventDefault();

    try {
      sendSearchLog();
      // Construct a complete Metaphor Annotation to store via Takita
      const updated = await storeAnalysis(currentAppState, latestOriginal, currentEtag);
      console.log('got updated annotation');
      setLatestOriginal(updated.originalAnnotation);
      setCurrentAppState(updated.appState);
      setCurrentEtag(updated.etag);

      const msg = new Message({
        text: 'saved analysis',
        type: 'success',
      });
      addMessage(msg);
    } catch (error) {
      if (error.status === 412) {
        const msg = new Message({
          text: 'Did not store analysis because it has been modified elsewhere since last page load.',
          type: 'error',
        });
        addMessage(msg);
      } else {
        throw error;
      }
    }
  };

  const onClickBack = (_ev) => {
    window.location = normalizeBasename(window.ANALYSIS_TOOL_BASENAME);
  };

  const onClickToDoc = (_ev) => {
    window.location = `${normalizeBasename(window.ANALYSIS_TOOL_BASENAME)}editor/${currentAppState.getDocId()}`;
  };

  let id;
  try {
    id = encodeURL(currentAppState.getId());
  } catch (e) {
    console.error('can not get MetaphorAnnotation Id, leading to broken AppState');
    console.error(currentAppState);
  }
  const navigation = [
    {
      label: 'Analyse',
      routes: [
        {
          label: 'Auxiliary Translation',
          route: createRoute(id, 'textvariant'),
          nav: true,
          icon: <Icon glyph='pencil' title='Auxiliary Translation' />,
        },
        {
          label: 'Propositions',
          route: createRoute(id, 'propositions'),
          nav: true,
          icon: <Icon glyph='propositions' title='Propositions' />,
        },
        {
          label: 'Open Mapping',
          route: createRoute(id, 'openmapping'),
          nav: true,
          icon: <Icon glyph='openmapping' title='Open Mapping' />,
        },
        {
          label: 'Complete Mapping',
          route: createRoute(id, 'completemapping'),
          nav: true,
          icon: <Icon glyph='completemapping' title='Complete Mapping' />,
        },
        {
          label: 'Linking',
          route: createRoute(id, 'linking'),
          nav: true,
          icon: <Icon glyph='linking' title='Linking' />,
        },
        {
          label: 'Conceptualizing',
          route: createRoute(id, 'conceptualizing'),
          nav: true,
          icon: <Icon glyph='abstraction' title='Conceptualizing' />,
        },
      ],
    },
    {
      label: 'Store',
      routes: [
        { label: 'Discard Changes', route: onClickReset, icon: <Icon glyph='undo' title='Discard Changes' /> },
        { label: 'Save Changes', route: onClickSave, icon: <Icon glyph='save' title='Save Changes' /> },
      ],
    },
    {
      label: 'Navigate',
      routes: [
        { label: 'Back to Overview', route: onClickBack, icon: <Icon glyph='list' title='Back to Overview' /> },
        { label: 'Back to Document', route: onClickToDoc, icon: <Icon glyph='document' title='Back to Document' /> },
      ],
    },
  ];

  return (
    <>
      <AnalysisSidebar segments={navigation}></AnalysisSidebar>

      <div className='analysis-content'>
        <Header target={normalizeBasename(window.ANALYSIS_TOOL_BASENAME)} />

        <div className='main-content-area'>
          <p className='debug'></p>

          <MessageBox messages={messages} onClear={clearMessages} />

          <Form method='post'>
            <Outlet context={[currentAppState, setCurrentAppState, addSearchLog]} />
          </Form>
        </div>
      </div>
    </>
  );
};

export { action, loader };
export default Analysis;
