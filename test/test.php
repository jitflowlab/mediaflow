<?php

$tmp = __DIR__ . '/tmp';
$post = [
    'file'=> curl_file_create(__DIR__ . '/media/test.jpg'),
    'action' => json_encode([
        [
            'name' => 'square',
            'resize' => '600, 600',
            'crop' => true,
            'output' => 'png'
        ]
    ])
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:3030/');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
$result = json_decode(curl_exec($ch), true);
curl_close($ch);

foreach ($result['files'] as $file) {
    $output = $tmp . '/' . $file['id'] . '.' . $file['output'];
    echo ' -> ' . $output . PHP_EOL;
    file_put_contents($output, base64_decode($file['base64']));
}
