import ProfileFields from "./ProfileFields";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../AuthContext';
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function UsersNewForm() {
  const { setUserId } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0]; // Format as yyyy-mm-dd
  const [selectedImage, setSelectedImage] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [user, setUser] = useState({
    profile_picture: "",
    username: "",
    bio: "",
    looking_for_group: false,
    date_created: formattedDate,
  });

  const addUser = (newUser) => {
    axios
      .post(`${API}/auth/register`, { ...newUser, password })
      .then(
      (res) => {
      setUserId(res.data.userId);
      navigate(`/users/${res.data.userId}`);
      })
      .catch((c) => {
        setError(c.response?.data?.error || 'Unable to create profile.')
      });
  };

  const handleTextChange = (event) => {
    if(event.target.id === "profile_picture"){
      setPreviewError(false);
      const test = event.target.value.split(".")
      const test1 = test[test.length - 1]

      if (test1 === "jpg" || test1 === "jpeg" || test1 === "png" ){
          // Figured out how to get to the image src but unable to create a deafult picture with there is an invalid src
          // let imageSrc = event.target.offsetParent.children[2].children[1].children[0].src
          setSelectedImage(event.target.value);
      } else setSelectedImage('');
    }
    setUser({ ...user, [event.target.id]: event.target.value });
  };

  const handleCheckboxChange = () => {
    setUser({ ...user, looking_for_group: !user.looking_for_group });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const test = user.profile_picture.split(".")
    const test1 = test[test.length - 1]
    if (
      test1 === "jpg" ||
      test1 === "jpeg" ||
      test1 === "png" 
    ) {
        addUser(user)
    } else {
        window.confirm(".jpg, .jpeg, and .png are the only supported image types.")
    }
  };

  return <div className="profile-form-card">
    <header className="account-header"><h1>Create profile</h1><p>Join EventLink and connect with others</p></header>
    <form onSubmit={handleSubmit}>
      <ProfileFields user={user} onTextChange={handleTextChange} onGroupChange={handleCheckboxChange}
        password={password} onPasswordChange={event => setPassword(event.target.value)}
        selectedImage={selectedImage} previewError={previewError}
        onPreviewError={() => { setSelectedImage(''); setPreviewError(true); }} date={formattedDate} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary profile-submit">Create profile</button>
    </form>
  </div>;
}

export default UsersNewForm;
