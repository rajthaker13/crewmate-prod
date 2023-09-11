import React, { useEffect, useState, useCallback } from "react";
import db, { auth, provider, functions, storage } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import "./TalentCreation.css"
import axios from 'axios'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useMergeLink } from "@mergeapi/react-merge-link";
import { useNavigate } from 'react-router-dom';


function TalentCreation() {
    return (
        <div>

        </div>
    )
}


export default TalentCreation