import React, { useEffect, useState } from "react";
import { interactWithAssistant } from "../open_ai/OpenAI";
import { Dropdown } from "@nextui-org/react";
import db, { auth } from "../firebase/firebase";
import SearchBar from "../components/common/SearchBar";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/ExploreJob.css";
import GenerateModal from "../components/pathways/GenerateModal";
import { ChatFeed, Message } from "react-chat-ui";
import { BackIcon } from "../components/pathways/BackIcon";

function ExploreJob() {
  const { state } = useLocation();
  const [job, setJob] = useState(state.job);
  const [pic, setPic] = useState(state.pfp);
  const [isMobile, setIsMobile] = useState(state.isMobile);
  const [jobRecs, setJobRecs] = useState(state.jobRecs);
  const [jobSaved, setJobSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messsages, setMessages] = useState([
    new Message({
      id: 1,
      message: `I'm a virtual recruiter for ${job.company_name}. Feel free to ask me anything about this job!`,
    }),
  ]);
  const [gptMessages, setGPTMessages] = useState([
    {
      role: "system",
      content: `You are a helpful virtual recruiting assistant for the following role: ${job.title} at ${job.company_name}. The user will ask you questions pertaining to the job and you will respond as if you are a recruiter at Google. Your name is Crewmate Recruiter.`,
    },
    {
      role: "assistant",
      content: `I'm a virtual recruiter for ${job.company_name}. Feel free to ask me anything about this job!`,
    },
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const navigation = useNavigate();

  useEffect(() => {
    async function isJobSaved() {
      let userDoc;
      if (!auth.currentUser) {
        userDoc = doc(db, "users", "rajthaker13@yahoo.com");
      } else {
        userDoc = doc(db, "users", auth.currentUser.email);
      }
      const userRef = await getDoc(userDoc);

      if (userRef.exists()) {
        let saved = userRef.data()["savedJobs"];
        if (saved == null) {
          saved = [];
        }
        saved.map((saved_job) => {
          if (saved_job.id == job.id) {
            setJobSaved(true);
          }
        });
      }
    }

    isJobSaved();
  }, []);

  async function sendMessage(userText) {
    let temp_msg = messsages;
    temp_msg.push(
      new Message({
        id: 0,
        message: userText,
      })
    );
    setMessages(temp_msg);
    setIsSearching(true);

    let temp_gpt = gptMessages;
    temp_gpt.push({
      role: "user",
      content: userText,
    });
    await interactWithAssistant(temp_gpt).then((res) => {
      temp_gpt.push({
        role: "assistant",
        content: res.content,
      });
      temp_msg.push(
        new Message({
          id: 1,
          message: res.content,
        })
      );
      setMessages(temp_msg);
      setGPTMessages(temp_gpt);
      setIsSearching(false);
    });
  }

  async function generateCoverLetter() {
    setIsGenerating(true);
    setIsGeneratingCover(true);
  }

  async function generateResumeText() {
    setIsGenerating(true);
    setIsGeneratingResume(true);
  }

  async function saveJob() {
    if (!jobSaved) {
      let userRef;
      if (!auth.currentUser) {
        userRef = doc(db, "users", "rajthaker13@yahoo.com");
      } else {
        userRef = doc(db, "users", auth.currentUser.email);
      }
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        let userSavedJobs = userSnap.data()["savedJobs"];
        if (userSavedJobs == null) {
          userSavedJobs = [job];
        } else {
          userSavedJobs.push(job);
        }
        updateDoc(userRef, {
          savedJobs: userSavedJobs,
        });
      }
      setJobSaved(true);
    }
  }

  function goBack() {
    if (!jobRecs) {
      navigation("/pathways");
    } else {
      navigation("/", {
        state: {
          jobRecs: jobRecs,
        },
      });
    }
  }
  return (
    <div>
      {!isMobile && (
        <div style={{ height: "88vh" }}>
          {isGenerating && (
            <GenerateModal
              isGeneratingResume={isGeneratingResume}
              isGeneratingCover={isGeneratingCover}
              job={job}
              setIsGenerating={setIsGenerating}
              setIsGeneratingCover={setIsGeneratingCover}
              setIsGeneratingResume={setIsGeneratingResume}
            />
          )}
          <div className="back-button-cont" onClick={goBack}>
            <BackIcon />
            <h5 className="back-button-text ">
              {jobRecs ? "Back to Search" : "Back to Saved Jobs"}
            </h5>
          </div>
          <div className="description_container">
            <div className="description_job_info">
              <img
                src={pic}
                className="description_icon"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = require("../assets/crewmate-emblem.png");
                }}
              ></img>
              <div className="description_job_title">
                <h4 className="description_job_title_heading">{`${job.title} @ ${job.company_name}`}</h4>
              </div>
            </div>
            <div className="description_description_cont">
              <h5 className="description_text">{job.description}</h5>
            </div>
            <div className="description_button_container">
              <button
                className="description_apply_button_container"
                onClick={() => {
                  if (job.external_url != null) {
                    window.open(job.external_url, "_blank");
                  } else {
                    window.open(job.redirected_url, "_blank");
                  }
                }}
              >
                <h6 className="description_apply_button_text">Apply Now</h6>
              </button>
              <button
                className="description_save_button_container"
                onClick={saveJob}
              >
                <FaBookmark fill={jobSaved ? "#fff" : ""} />
                <h6 className="description_save_button_text">
                  {jobSaved ? "Saved" : "Save"}
                </h6>
              </button>
            </div>
          </div>
          <div className="generate_cv_container">
            <h5 className="generate_cv_text">
              Craft an AI-imbued cover letter aligning experience with the job
              description. <br /> Generate AI-infused resume bullet points to
              match job requisites.
            </h5>
            <Dropdown>
              <Dropdown.Button
                color="secondary"
                shadow
                className="generate_button"
              >
                Generate
              </Dropdown.Button>
              <Dropdown.Menu
                color="secondary"
                variant="shadow"
                aria-label="Actions"
              >
                <Dropdown.Item key="cover" textValue="Generate Cover Letter">
                  <h6 onClick={generateCoverLetter}>Generate Cover Letter</h6>
                </Dropdown.Item>
                <Dropdown.Item key="cv" textValue="Generate CV Text">
                  <h6 onClick={generateResumeText}>Generate CV Text</h6>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div style={{ flexDirection: "row", display: "flex" }}>
            <div className="generate_courses_container">
              <h5 className="content_header_text">
                Crewmate Virtual Assistant
              </h5>
              <ChatFeed
                messages={messsages} // Array: list of message objects
                isTyping={isSearching} // Boolean: is the recipient typing
                hasInputField={false} // Boolean: use our input, or use your own
                showSenderName // show the name of the user who sent the message
                bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                bubbleStyles={{
                  text: {
                    fontSize: 18,
                    textAlign: "left",
                  },
                }}
              />
              <SearchBar isInputField={true} sendMessage={sendMessage} />
              <div className="explore-enter-text">
                <h5>
                  Press Enter <span className="">to send message</span>
                </h5>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div style={{ height: "auto" }}>
          {isGenerating && (
            <GenerateModal
              isGeneratingResume={isGeneratingResume}
              isGeneratingCover={isGeneratingCover}
              job={job}
              setIsGenerating={setIsGenerating}
              setIsGeneratingCover={setIsGeneratingCover}
              setIsGeneratingResume={setIsGeneratingResume}
              isMobile={true}
            />
          )}
          <div className="back-button-cont" onClick={goBack}>
            <BackIcon />
            <h5 className="back-button-text ">
              {jobRecs ? "Back to Search" : "Back to Saved Jobs"}
            </h5>
          </div>
          <div className="description_container-mobile">
            <div className="description_job_info">
              <img
                src={pic}
                className="description_icon-mobile"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = require("../assets/crewmate-emblem.png");
                }}
              ></img>
              <h4 className="description_job_title_heading-mobile">{`${job.company_name}`}</h4>
            </div>
            <div className="description_job_title">
              <h4 className="description_job_title_heading-2-mobile">{`${job.title} @ ${job.company_name}`}</h4>
            </div>
            <div className="description_description_cont">
              <h5 className="description_text">{job.description}</h5>
            </div>
            <div className="description_button_container">
              <button
                className="description_apply_button_container-mobile"
                onClick={() => {
                  if (job.external_url != null) {
                    window.open(job.external_url, "_blank");
                  } else {
                    window.open(job.redirected_url, "_blank");
                  }
                }}
              >
                <h6 className="description_apply_button_text">Apply Now</h6>
              </button>
              <button
                className="description_save_button_container-mobile"
                onClick={saveJob}
              >
                <FaBookmark fill={jobSaved ? "#fff" : ""} />
                <h6 className="description_save_button_text">
                  {jobSaved ? "Saved" : "Save"}
                </h6>
              </button>
            </div>
          </div>
          <div className="generate_cv_container-mobile">
            <h5 className="generate_cv_text-mobile">
              Craft an AI-imbued cover letter aligning experience with the job
              description. <br /> Generate AI-infused resume bullet points to
              match job requisites.
            </h5>
            <Dropdown>
              <Dropdown.Button
                color="secondary"
                shadow
                className="generate_button-mobile"
              >
                Generate
              </Dropdown.Button>
              <Dropdown.Menu
                color="secondary"
                variant="shadow"
                aria-label="Actions"
              >
                <Dropdown.Item key="cover" textValue="Generate Cover Letter">
                  <h6 onClick={generateCoverLetter}>Generate Cover Letter</h6>
                </Dropdown.Item>
                <Dropdown.Item key="cv" textValue="Generate CV Text">
                  <h6 onClick={generateResumeText}>Generate CV Text</h6>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div style={{ flexDirection: "row", display: "flex" }}>
            <div className="generate_courses_container">
              <h5 className="content_header_text">
                Crewmate Virtual Assistant
              </h5>
              <ChatFeed
                messages={messsages} // Array: list of message objects
                isTyping={isSearching} // Boolean: is the recipient typing
                hasInputField={false} // Boolean: use our input, or use your own
                showSenderName // show the name of the user who sent the message
                bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                bubbleStyles={{
                  text: {
                    fontSize: 14,
                    textAlign: "left",
                  },
                }}
              />
              <SearchBar isInputField={true} sendMessage={sendMessage} />
              <div className="explore-enter-text">
                <h5>
                  Press Enter <span className="">to send message</span>
                </h5>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreJob;
