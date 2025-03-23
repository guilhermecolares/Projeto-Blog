export default {
    eAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            return next()
        } else {
            req.flash('error_msg', 'Você não tem permissão para isso!')
            res.redirect('/')
        }
    }
}
