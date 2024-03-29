import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import IconIo from 'react-native-vector-icons/Ionicons';

import { loadStatsRequest } from '~/store/modules/stats/actions';
import { pollLoading } from '~/store/modules/poll/actions';

import {
  Container,
  Scroll,
  Card,
  Title,
  Row,
  WrapperVote,
  WrapperOption,
  Option,
  Bar,
  Votes,
} from './styles';

import Loader from '~/components/Loader';
import Button from '~/components/Button';

export default function Stats({ navigation }) {
  const [votes, setVotes] = useState([]);

  const [widthProgress] = useState(new Animated.Value(0));

  const currentVote = useSelector((state) => state.vote.data);
  const stats = useSelector((state) => state.stats.data);
  const loading = useSelector((state) => state.stats.loading);
  const currentPoll = useSelector((state) => state.poll.currentPoll);

  const dispatch = useDispatch();

  const home = navigation.state.params ? navigation.state.params.home : false;

  function handleBack() {
    dispatch(pollLoading());
    navigation.navigate('Home');
  }

  useEffect(() => {
    if (currentPoll.poll_id) {
      dispatch(loadStatsRequest(currentPoll.poll_id));
    }
  }, [currentPoll.poll_id, dispatch]);

  useEffect(() => {
    if (stats.votes) {
      const newVotes = [];

      const { qty: maxQtyd } = stats.votes.reduce((prev, current) =>
        prev.qty > current.qty ? prev : current
      );

      currentPoll.options.map((option) => {
        const currentVote = stats.votes.find(
          (vote) => vote.option_id === option.option_id
        );

        if (currentVote) {
          newVotes.push({
            ...option,
            ...currentVote,
            percent_bar: Math.ceil(100 * currentVote.qty) / maxQtyd,
          });
        }
      });

      setVotes(newVotes);
    }
  }, [currentPoll.options, stats.votes]);

  useEffect(() => {
    if (votes.length > 0) {
      Animated.timing(widthProgress, {
        toValue: 100,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }
  }, [votes.length, widthProgress]);

  return (
    <Container>
      {loading || votes.length === 0 ? (
        <Loader />
      ) : (
        <Scroll>
          <Card>
            <Title>Estatísticas</Title>
            {votes.map((vote) => (
              <Row key={String(vote.option_id)}>
                {!home && (
                  <WrapperVote>
                    {currentVote.option_id === vote.option_id ? (
                      <IconIo
                        name="ios-radio-button-on"
                        size={20}
                        color="#ccc"
                      />
                    ) : (
                      <IconIo
                        name="ios-radio-button-off"
                        size={20}
                        color="#ccc"
                      />
                    )}
                  </WrapperVote>
                )}
                <WrapperOption>
                  <Option>{vote.option_description}</Option>
                </WrapperOption>
                <Animated.View
                  style={{
                    flex: widthProgress.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, 1],
                      extrapolate: 'clamp',
                    }),
                  }}>
                  <Bar width={vote.percent_bar}>
                    <Votes>{vote.qty}</Votes>
                  </Bar>
                </Animated.View>
              </Row>
            ))}

            <Button text="Voltar" marginTop={56} onPress={handleBack} />
          </Card>
        </Scroll>
      )}
    </Container>
  );
}
