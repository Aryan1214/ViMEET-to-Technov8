import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";


import axios from "axios";
import { motion } from "framer-motion";

const InterviewerBot = () => {
  const [stream, setStream] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [score, setScore] = useState(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  const startInterview = async () => {
    try {
      const response = await axios.post("http://localhost:5000/start", { stream });
      setQuestion(response.data.question);
      setIsInterviewStarted(true);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
  };

  const submitAnswer = async () => {
    try {
      const response = await axios.post("http://localhost:5000/answer", {
        answer,
      });
      setChatHistory((prev) => [
        ...prev,
        { question, answer, score: response.data.score },
      ]);
      setScore(response.data.score);
      setAnswer("");
      if (response.data.next_question) {
        setQuestion(response.data.next_question);
      } else {
        setQuestion("");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <motion.h1
        className="text-3xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        NLP Interviewer Bot
      </motion.h1>

      {!isInterviewStarted ? (
        <Card className="p-4">
          <CardContent>
            <Select onValueChange={(val) => setStream(val)}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select your stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="computer">Computer Engineering</SelectItem>
                <SelectItem value="electrical">Electrical Engineering</SelectItem>
                <SelectItem value="extc">EXTC</SelectItem>
                <SelectItem value="ml">Machine Learning Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={startInterview} disabled={!stream}>
              Start Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {question && (
            <Card className="mb-4">
              <CardContent>
                <p className="text-xl font-semibold">{question}</p>
                <Input
                  className="mt-4"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <Button className="mt-2" onClick={submitAnswer} disabled={!answer}>
                  Submit Answer
                </Button>
              </CardContent>
            </Card>
          )}

          <h2 className="text-2xl font-bold mt-6 mb-2">Chat History</h2>
          <div className="space-y-2">
            {chatHistory.map((item, index) => (
              <Card key={index} className="p-4">
                <CardContent>
                  <p className="font-semibold">Q: {item.question}</p>
                  <p>A: {item.answer}</p>
                  <p className="text-green-600">Score: {item.score}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewerBot;
