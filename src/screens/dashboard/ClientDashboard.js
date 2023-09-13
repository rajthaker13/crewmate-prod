import React, { useEffect, useState, useCallback } from "react";
import db, { auth, provider, functions, storage } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import "./ClientDashboard.css"
import axios from 'axios'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useMergeLink } from "@mergeapi/react-merge-link";
import { useNavigate } from 'react-router-dom';


function ClientDashboard() {

    return (
        <div>
            <h1>HET</h1>
        </div>
    )
}


export default ClientDashboard