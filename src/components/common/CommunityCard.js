import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link } from '@nextui-org/react';


export function CommunityCard(props) {
    return (
        <Grid xs={2}>
            <Card css={{ p: "$6", mw: "400px" }} style={{ backgroundColor: '#2E1069', height: '80%' }}>
                <Card.Header>
                    <img
                        alt="nextui logo"
                        src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                        width="45px"
                        height="45px"
                    />
                    <Grid.Container css={{ pl: "$6" }}>
                        <Grid xs={12}>
                            <Text h4 css={{ lineHeight: "$xs", color: '#FFFFFF', fontFamily: 'Inter' }}>
                                Tesla Nerds
                            </Text>
                        </Grid>
                        <Grid xs={10}>
                            <Text css={{ color: "$accents8" }}>1.9k Members</Text>
                        </Grid>
                    </Grid.Container>

                </Card.Header>
            </Card>
        </Grid>
    )
}

export default CommunityCard